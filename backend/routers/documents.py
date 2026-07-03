import io
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from pypdf import PdfReader
from backend.config import settings
from backend.routers.auth import get_current_user
from backend.services.ai_service import ai_service
from backend.mock_db import documents_db

router = APIRouter(prefix="/documents", tags=["Document AI"])

class DocumentResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    summary_en: str | None
    summary_ar: str | None
    highlights_en: list
    highlights_ar: list
    created_at: str

@router.get("", response_model=list[DocumentResponse])
def list_documents(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if settings.MOCK_MODE:
        user_docs = [doc for doc in documents_db.values() if doc["user_id"] == user_id]
        # Sort by created_at desc
        user_docs.sort(key=lambda x: x["created_at"], reverse=True)
        return user_docs
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            res = supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            # Standardize output model
            parsed_docs = []
            for d in res.data:
                parsed_docs.append({
                    "id": d["id"],
                    "file_name": d["file_name"],
                    "file_size": d["file_size"],
                    "summary_en": d.get("summary_en"),
                    "summary_ar": d.get("summary_ar"),
                    "highlights_en": d.get("highlights_en", []),
                    "highlights_ar": d.get("highlights_ar", []),
                    "created_at": d["created_at"]
                })
            return parsed_docs
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    lang: str = Form("en"),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    
    # Read file content
    contents = await file.read()
    file_size = len(contents)
    file_name = file.filename
    
    # Basic size limits
    if file_size > 10 * 1024 * 1024: # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB.")
        
    extracted_text = ""
    
    # Try reading PDF text
    if file.content_type == "application/pdf":
        try:
            pdf_file = io.BytesIO(contents)
            reader = PdfReader(pdf_file)
            for page in reader.pages[:10]: # Read first 10 pages maximum
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
        except Exception as e:
            print(f"Error reading PDF content: {e}")
            extracted_text = f"[Could not parse PDF layout text. Fallback to indexing name: {file_name}]"
    else:
        # Txt or simple text fallbacks
        try:
            extracted_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = f"[Binary non-PDF content: {file_name}]"
            
    if not extracted_text.strip():
        extracted_text = f"[Placeholder text for document: {file_name}]"

    # Analyze document with AI
    analysis_en = ai_service.summarize_legal_document(extracted_text, file_name, lang="en")
    analysis_ar = ai_service.summarize_legal_document(extracted_text, file_name, lang="ar")
    
    doc_uuid = str(uuid.uuid4())
    
    # Save document record
    if settings.MOCK_MODE:
        document_record = {
            "id": doc_uuid,
            "user_id": user_id,
            "file_name": file_name,
            "file_size": file_size,
            "storage_path": f"mock://storage/documents/{doc_uuid}_{file_name}",
            "summary_en": analysis_en.get("summary"),
            "summary_ar": analysis_ar.get("summary"),
            "highlights_en": analysis_en.get("highlights", []),
            "highlights_ar": analysis_ar.get("highlights", []),
            "created_at": datetime.utcnow().isoformat()
        }
        documents_db[doc_uuid] = document_record
        return document_record
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # 1. Upload to Supabase Storage Bucket (named 'documents')
            bucket_name = "documents"
            storage_path = f"{user_id}/{doc_uuid}_{file_name}"
            
            try:
                # Attempt to upload binary contents
                supabase.storage.from_(bucket_name).upload(storage_path, contents)
            except Exception as se:
                print(f"Failed uploading to storage bucket: {se}. Using mock path instead.")
                storage_path = f"fallback://storage/{storage_path}"
                
            # 2. Save metadata in DB
            db_record = {
                "id": doc_uuid,
                "user_id": user_id,
                "file_name": file_name,
                "file_size": file_size,
                "storage_path": storage_path,
                "summary_en": analysis_en.get("summary"),
                "summary_ar": analysis_ar.get("summary"),
                "highlights_en": analysis_en.get("highlights", []),
                "highlights_ar": analysis_ar.get("highlights", []),
            }
            res = supabase.table("documents").insert(db_record).execute()
            return res.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database execution error: {str(e)}")

@router.delete("/{doc_id}")
def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if settings.MOCK_MODE:
        if doc_id not in documents_db or documents_db[doc_id]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Document not found")
        del documents_db[doc_id]
        return {"status": "success", "message": "Document deleted"}
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Fetch storage path first to delete file from storage
            doc_res = supabase.table("documents").select("*").eq("id", doc_id).eq("user_id", user_id).execute()
            if not doc_res.data:
                raise HTTPException(status_code=404, detail="Document not found")
                
            doc_record = doc_res.data[0]
            storage_path = doc_record["storage_path"]
            
            # Delete from table
            supabase.table("documents").delete().eq("id", doc_id).execute()
            
            # Try delete from storage bucket
            try:
                if not storage_path.startswith("fallback://"):
                    supabase.storage.from_("documents").remove([storage_path])
            except Exception as se:
                print(f"Failed deleting from storage bucket: {se}")
                
            return {"status": "success", "message": "Document deleted"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

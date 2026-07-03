import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config import settings
from routers.auth import get_current_user
from services.ai_service import ai_service
from mock_db import chats_db, messages_db

router = APIRouter(prefix="/chats", tags=["AI Chat"])

class ChatCreate(BaseModel):
    title: str

class MessageSend(BaseModel):
    content: str
    lang: str = "en"

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    citations: list
    created_at: str

class ChatResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str

@router.get("", response_model=list[ChatResponse])
def list_chats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if settings.MOCK_MODE:
        user_chats = [chat for chat in chats_db.values() if chat["user_id"] == user_id]
        # Sort by created_at desc
        user_chats.sort(key=lambda x: x["created_at"], reverse=True)
        return user_chats
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            res = supabase.table("chats").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return res.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=ChatResponse)
def create_chat(chat_in: ChatCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    chat_id = str(uuid.uuid4())
    
    if settings.MOCK_MODE:
        new_chat = {
            "id": chat_id,
            "user_id": user_id,
            "title": chat_in.title,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        chats_db[chat_id] = new_chat
        return new_chat
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            insert_data = {
                "user_id": user_id,
                "title": chat_in.title
            }
            res = supabase.table("chats").insert(insert_data).execute()
            return res.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def get_chat_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    # Verify chat ownership
    if settings.MOCK_MODE:
        chat = chats_db.get(chat_id)
        if not chat or chat["user_id"] != current_user["id"]:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat_msgs = [msg for msg in messages_db if msg["chat_id"] == chat_id]
        # Sort by created_at asc
        chat_msgs.sort(key=lambda x: x["created_at"])
        return chat_msgs
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Verify chat belongs to user
            chat_check = supabase.table("chats").select("*").eq("id", chat_id).eq("user_id", current_user["id"]).execute()
            if not chat_check.data:
                raise HTTPException(status_code=404, detail="Chat not found")
                
            res = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=False).execute()
            return res.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/{chat_id}/messages", response_model=MessageResponse)
def send_message(chat_id: str, payload: MessageSend, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # 1. Verify ownership & get history
    history = []
    if settings.MOCK_MODE:
        chat = chats_db.get(chat_id)
        if not chat or chat["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Pull history
        chat_msgs = [msg for msg in messages_db if msg["chat_id"] == chat_id]
        chat_msgs.sort(key=lambda x: x["created_at"])
        history = chat_msgs
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            chat_check = supabase.table("chats").select("*").eq("id", chat_id).eq("user_id", user_id).execute()
            if not chat_check.data:
                raise HTTPException(status_code=404, detail="Chat not found")
                
            history_res = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=False).execute()
            history = history_res.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # 2. Save User Message
    user_msg_id = str(uuid.uuid4())
    user_msg_data = {
        "id": user_msg_id,
        "chat_id": chat_id,
        "role": "user",
        "content": payload.content,
        "citations": [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    if settings.MOCK_MODE:
        messages_db.append(user_msg_data)
    else:
        try:
            supabase.table("messages").insert({
                "chat_id": chat_id,
                "role": "user",
                "content": payload.content,
                "citations": []
            }).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save user message: {str(e)}")

    # 3. Call AI Service for legal response
    ai_response = ai_service.get_legal_chat_response(
        user_message=payload.content,
        chat_history=[{"role": m["role"], "content": m["content"]} for m in history],
        lang=payload.lang
    )

    # 4. Save Assistant Message
    assistant_msg_id = str(uuid.uuid4())
    assistant_msg_data = {
        "id": assistant_msg_id,
        "chat_id": chat_id,
        "role": "assistant",
        "content": ai_response["content"],
        "citations": ai_response["citations"],
        "created_at": datetime.utcnow().isoformat()
    }
    
    if settings.MOCK_MODE:
        messages_db.append(assistant_msg_data)
        # Update chat timestamp
        if chat_id in chats_db:
            chats_db[chat_id]["updated_at"] = datetime.utcnow().isoformat()
        return assistant_msg_data
    else:
        try:
            res = supabase.table("messages").insert({
                "chat_id": chat_id,
                "role": "assistant",
                "content": ai_response["content"],
                "citations": ai_response["citations"]
            }).execute()
            
            # Update chat updated_at timestamp
            supabase.table("chats").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", chat_id).execute()
            
            return res.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save assistant message: {str(e)}")
            
@router.delete("/{chat_id}")
def delete_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if settings.MOCK_MODE:
        chat = chats_db.get(chat_id)
        if not chat or chat["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Remove from db
        del chats_db[chat_id]
        # Remove message history
        global messages_db
        messages_db = [msg for msg in messages_db if msg["chat_id"] != chat_id]
        return {"status": "success", "message": "Chat deleted"}
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            # Verify chat belongs to user
            chat_check = supabase.table("chats").select("*").eq("id", chat_id).eq("user_id", user_id).execute()
            if not chat_check.data:
                raise HTTPException(status_code=404, detail="Chat not found")
                
            supabase.table("chats").delete().eq("id", chat_id).execute()
            return {"status": "success", "message": "Chat deleted"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

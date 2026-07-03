from fastapi import APIRouter, Depends, HTTPException, Query
from config import settings
from mock_db import gov_services_db

router = APIRouter(prefix="/services", tags=["Government Services"])

@router.get("")
def get_services(
    query: str = Query(None, description="Search keyword"),
    category: str = Query(None, description="Category filter (e.g., Visa, Labour)")
):
    if settings.MOCK_MODE:
        results = gov_services_db
        if category:
            results = [s for s in results if s["category"].lower() == category.lower()]
        if query:
            q = query.lower()
            results = [
                s for s in results if (
                    q in s["title_en"].lower() or
                    q in s["title_ar"].lower() or
                    q in s["description_en"].lower() or
                    q in s["description_ar"].lower() or
                    q in s["category"].lower()
                )
            ]
        return results
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            
            builder = supabase.table("gov_services").select("*")
            
            if category:
                builder = builder.eq("category", category)
                
            res = builder.execute()
            results = res.data
            
            # Post-filter if search query is provided
            if query:
                q = query.lower()
                results = [
                    s for s in results if (
                        q in s["title_en"].lower() or
                        q in s["title_ar"].lower() or
                        q in s["description_en"].lower() or
                        q in s["description_ar"].lower() or
                        q in s["category"].lower()
                    )
                ]
            return results
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/{service_id}")
def get_service_by_id(service_id: int):
    if settings.MOCK_MODE:
        service = next((s for s in gov_services_db if s["id"] == service_id), None)
        if not service:
            raise HTTPException(status_code=404, detail="Government service not found")
        return service
    else:
        try:
            from supabase import create_client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            res = supabase.table("gov_services").select("*").eq("id", service_id).execute()
            if not res.data:
                raise HTTPException(status_code=404, detail="Government service not found")
            return res.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

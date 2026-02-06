from fastapi import APIRouter
from src.core.supabase import supabase

router = APIRouter()

@router.get("/db")
def db_health():
    # Simple read to confirm connectivity
    response = supabase.table("users").select("id").limit(1).execute()
    return {
        "status": "ok",
        "db": "reachable",
        "rows_checked": len(response.data or [])
    }

from fastapi import Depends, Header, HTTPException
from src.core.auth import verify_supabase_jwt

async def get_current_user(
    authorization: str = Header(...)
) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.split(" ")[1]
    return await verify_supabase_jwt(token)

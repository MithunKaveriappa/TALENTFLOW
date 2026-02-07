from fastapi import APIRouter, Depends

router = APIRouter(prefix="/auth", tags=["auth"])

# POST /auth/post-login
# Purpose:
# - Called immediately after successful Supabase login
# - Verifies JWT (dependency)
# - Ensures user exists in users table
# - Determines next onboarding step
# - Returns { next_step: string }
@router.get("/post-login")
def post_login():
    pass

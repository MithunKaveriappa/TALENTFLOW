from fastapi import HTTPException, status
from .supabase import supabase

def verify_supabase_jwt(token: str) -> dict:
    try:
        # Instead of manual JWT verification with JWKS (which fails for HS256),
        # we let Supabase's own Auth service verify the token.
        # This works for both HS256 and RS256.
        user_res = supabase.auth.get_user(token)
        
        if not user_res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
        
        # Return a payload structure similar to what we had before
        # 'sub' is the user_id in Supabase JWTs
        user = user_res.user
        return {
            "sub": user.id,
            "email": user.email,
            "role": user.role
        }

    except Exception as e:
        err_msg = str(e)
        print(f"ERR: JWT Verification failed: {err_msg}")
        
        # Handle specific connection errors with clearer messages
        if "disconnected" in err_msg.lower() or "connection" in err_msg.lower():
            detail = "Identity server connection failed. Please ensure the backend can reach Supabase."
        else:
            detail = f"Invalid authentication token: {err_msg}"
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )

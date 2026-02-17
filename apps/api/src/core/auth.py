from fastapi import HTTPException, status
from .supabase import supabase
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    reraise=True
)
def _get_user_with_retry(token: str):
    return supabase.auth.get_user(token)

def verify_supabase_jwt(token: str) -> dict:
    try:
        if not token:
            raise ValueError("Token is empty or null")
            
        # Debugging timeout issues
        print(f"DEBUG AUTH: Verifying token (length: {len(token)})")
        
        # Use retry logic for network-flaky SSL handshakes
        user_res = _get_user_with_retry(token)
        
        if not user_res or not user_res.user:
            print(f"DEBUG AUTH: Verification failed for token starting with {token[:10]}...")
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
        print(f"CRITICAL AUTH ERROR: {err_msg}")
        
        # Check if the error is due to Supabase connection
        if any(word in err_msg.lower() for word in ["disconnected", "connection", "timeout", "network"]):
            detail = f"Identity server connection failed (Technical: {err_msg[:50]}...)"
        else:
            detail = f"Invalid authentication token: {err_msg}"
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )

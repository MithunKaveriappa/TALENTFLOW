from fastapi import HTTPException, status
from .supabase import async_supabase as supabase
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import asyncio

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=5),
    retry=retry_if_exception_type((ConnectionError, TimeoutError, asyncio.TimeoutError)),
    reraise=True
)
async def _get_user_with_retry(token: str):
    # Using async client for significantly higher reliability on SSL/TLS connections
    return await supabase.auth.get_user(token)

async def verify_supabase_jwt(token: str) -> dict:
    try:
        if not token or len(token) < 80: # Real Supabase JWTs are much longer
            print(f"DEBUG AUTH: REJECTED MALFORMED TOKEN (length: {len(token)})")
            raise ValueError(f"Malformed authentication token (too short: {len(token)})")
            
        # Debugging timeout issues
        print(f"DEBUG AUTH: Verifying token (length: {len(token)})")
        
        # Use retry logic ONLY for network-flaky SSL handshakes/timeouts
        try:
            user_res = await _get_user_with_retry(token)
        except ValueError as ve:
             # Don't try to retry on value errors from within the library if it gives them
             raise ve
        except Exception as e:
            # Re-wrap known Supabase segment/parsing errors to avoid retry
            err_msg = str(e).lower()
            if "invalid" in err_msg or "segments" in err_msg or "malformed" in err_msg:
                 raise ValueError(f"Identity Auth Error: {str(e)}")
            raise e
        
        if not user_res or not user_res.user:
            print(f"DEBUG AUTH: Verification failed for token starting with {token[:10]}...")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
        
        # payload structure similar to what we had before
        # 'sub' is the user_id in Supabase JWTs
        user = user_res.user
        print(f"DEBUG AUTH: SUCCESS - {user.email} verified.")
        
        # We MUST fetch the actual role from our public.users table 
        # using the async client for safety in high-concurrency loops
        public_user_res = await supabase.table("users").select("role").eq("id", user.id).execute()
        actual_role = public_user_res.data[0].get("role", "candidate") if public_user_res.data else "candidate"
        
        return {
            "sub": user.id,
            "email": user.email,
            "role": actual_role
        }

    except Exception as e:
        import traceback
        err_msg = str(e)
        print(f"CRITICAL AUTH ERROR: {err_msg}")
        # traceback.print_exc() # Less spam in logs
        
        # Check if the error is due to Supabase connection
        if any(word in err_msg.lower() for word in ["disconnected", "connection", "timeout", "network", "refused", "closed", "ssl"]):
            # Normalize the error message to prevent confusing the user
            detail = f"Identity server connection failed (Technical: {err_msg[:50]}...)"
        else:
            detail = f"Invalid authentication token: {err_msg}"
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )

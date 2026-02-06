from jose import jwt, JWTError
import requests
from fastapi import HTTPException, status

SUPABASE_JWKS_URL = (
    "https://snzqqjrmthqdezozgvsp.supabase.co"
)

def verify_supabase_jwt(token: str) -> dict:
    try:
        jwks = requests.get(SUPABASE_JWKS_URL).json()
        unverified_header = jwt.get_unverified_header(token)

        key = next(
            k for k in jwks["keys"]
            if k["kid"] == unverified_header["kid"]
        )

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience="authenticated"
        )

        return payload

    except (JWTError, StopIteration):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

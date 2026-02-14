from supabase import create_client, ClientOptions
from .config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    options=ClientOptions(
        postgrest_client_timeout=30,
        storage_client_timeout=30
    )
)

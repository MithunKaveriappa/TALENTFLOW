from supabase import create_client, create_async_client, ClientOptions, AsyncClient
from .config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Sync Client
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    options=ClientOptions(
        postgrest_client_timeout=30,
        storage_client_timeout=30
    )
)

# Async Client (Better for high-concurrency loops and stable SSL)
async_supabase: AsyncClient = AsyncClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    options=ClientOptions(
        postgrest_client_timeout=60,
        storage_client_timeout=60
    )
)

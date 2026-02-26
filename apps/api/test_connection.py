import os
from dotenv import load_dotenv
from supabase import create_client
import sys

# Load env
env_path = os.path.join(os.getcwd(), ".env")
load_dotenv(env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"DEBUG: Testing Supabase Connection at {url}")

try:
    supabase = create_client(url, key)
    res = supabase.table("users").select("count", count="exact").limit(1).execute()
    print(f"SUCCESS: Connected to Supabase. Found {res.count} users.")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to connect to Supabase: {str(e)}")
    sys.exit(1)

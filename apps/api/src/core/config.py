import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
# Path: apps/api/src/core/config.py -> ../../../../.env
current_dir = Path(__file__).resolve().parent
env_path = None

# Search up to 5 levels for the .env file
for _ in range(5):
    if (current_dir / ".env").exists():
        env_path = current_dir / ".env"
        break
    current_dir = current_dir.parent

if env_path:
    print(f"DEBUG: Loading environment from {env_path}")
    load_dotenv(dotenv_path=env_path)
else:
    print("DEBUG: No .env file found in parent directories, using system env")
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY or not SUPABASE_ANON_KEY:
    raise RuntimeError("Supabase environment variables are not set")

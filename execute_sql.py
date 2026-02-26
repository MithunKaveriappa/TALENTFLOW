import os
from dotenv import load_dotenv
from supabase import create_client

def execute_sql_file(file_path):
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)
    
    with open(file_path, 'r') as f:
        sql = f.read()
        
    # Using a simple raw SQL execution if possible, or individual statements
    # Supabase doesn't have a direct 'exec_sql' RPC by default unless created
    # We will try to execute it by splitting or via a known RPC if exists.
    
    # Try common approach: split by semicolon if no complex blocks
    statements = [s.strip() for s in sql.split(';') if s.strip()]
    for statement in statements:
        try:
            # We use Postgres direct execution via postgrest is not possible for DDL
            # But we can use the 'supabase' library's postgrest client for RPC if we have one.
            # If 'exec_sql' exists in their DB, it will work.
            res = supabase.rpc('exec_sql', {'sql_query': statement}).execute()
            print(f"Executed: {statement[:50]}... Success: {res}")
        except Exception as e:
            print(f"Error executing: {statement[:50]}... Error: {e}")

if __name__ == "__main__":
    import sys
    execute_sql_file(sys.argv[1])

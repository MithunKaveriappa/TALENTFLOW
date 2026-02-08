from src.core.supabase import supabase

def fix_schema():
    print("Attempting to add column 'skills' to 'candidate_profiles'...")
    try:
        # We use a raw RPC or a dummy update to check visibility, 
        # but since we can't run arbitrary SQL via the basic client without a vault function,
        # we will provide the user the exact SQL to run in the dashboard.
        
        sql = "ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS skills TEXT[];"
        
        print("\n--- ACTION REQUIRED ---")
        print("The Supabase Python client cannot modify table schemas directly for security reasons.")
        print("Please follow these steps:")
        print("1. Go to your Supabase Dashboard: https://supabase.com/dashboard")
        print("2. Open the 'SQL Editor' from the left sidebar.")
        print("3. Paste and run the following command:\n")
        print(f"   {sql}")
        print("\n4. After running it, click 'API' -> 'PostgREST' settings to 'Reload Schema' if available, otherwise it should auto-refresh.")
        print("------------------------\n")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_schema()

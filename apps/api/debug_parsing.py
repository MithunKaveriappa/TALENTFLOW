from src.core.supabase import supabase
import json

def check_resume_parsing_health():
    print("--- 🔍 TALENTFLOW RESUME PARSING AUDIT ---")
    
    # 1. Check resume_data table
    try:
        res_data = supabase.table("resume_data").select("user_id, parsed_at").order("parsed_at", desc=True).limit(5).execute()
        count_res = supabase.table("resume_data").select("count", count="exact").execute()
        total = count_res.count or 0
        
        print(f"Total Resumes in Audit Log: {total}")
        if res_data.data:
            print("\nLatest 5 Parses:")
            for r in res_data.data:
                print(f" - User: {r['user_id']} | Parsed At: {r['parsed_at']}")
        else:
            print("⚠️ No data found in 'resume_data' table.")
            
    except Exception as e:
        print(f"❌ Error accessing 'resume_data': {str(e)}")

    # 2. Check candidate_profiles high-fidelity fields
    try:
        prof_res = supabase.table("candidate_profiles").select("user_id, last_resume_parse_at, ai_extraction_confidence").neq("last_resume_parse_at", None).execute()
        parsed_profiles = len(prof_res.data) if prof_res.data else 0
        print(f"\nProfiles with AI-extracted data: {parsed_profiles}")
        
    except Exception as e:
        print(f"❌ Error accessing 'candidate_profiles': {str(e)}")

    # 3. Check for specific common failures (Missing skills/timeline)
    try:
        fail_check = supabase.table("candidate_profiles").select("user_id").eq("skills", []).neq("last_resume_parse_at", None).execute()
        if fail_check.data:
            print(f"⚠️ Warning: {len(fail_check.data)} profiles have AI data but empty skills lists.")
    except: pass

if __name__ == "__main__":
    check_resume_parsing_health()

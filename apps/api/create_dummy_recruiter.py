import asyncio
import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from src.core.supabase import supabase
from src.core.config import SUPABASE_URL

def create_dummy_recruiter():
    email = "recruiter@talentcore.io"
    password = "Password123!"
    
    print(f"--- CREATING DUMMY RECRUITER ---")
    print(f"Target: {email}")
    
    try:
        # 1. Create User in Auth if not exists
        # Use admin API (requires service_role key)
        # Note: .auth.admin is direct in supabase-py
        try:
            user_response = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            user_id = user_response.user.id
            print(f"User created with ID: {user_id}")
        except Exception as auth_err:
            print(f"Auth creation failed (likely exists): {auth_err}")
            # Try to fetch existing
            res = supabase.table("users").select("id").eq("email", email).execute()
            if res.data:
                user_id = res.data[0]['id']
                print(f"Found existing user with ID: {user_id}")
            else:
                print("Could not find user. Please check Supabase logs.")
                return

        # 2. Insert/Update public.users
        supabase.table("users").upsert({
            "id": user_id,
            "email": email,
            "role": "recruiter"
        }).execute()
        
        # 3. Create dummy company
        company_res = supabase.table("companies").insert({
            "name": "TalentFlow Demo Corp",
            "website": "https://demo.talentflow.ai",
            "industry_category": "Technology"
        }).execute()
        
        company_id = company_res.data[0]['id'] if company_res.data else None
        
        # 4. Create/Update Recruiter Profile
        supabase.table("recruiter_profiles").upsert({
            "user_id": user_id,
            "company_id": company_id,
            "full_name": "Demo Recruiter",
            "job_title": "Talent Acquisition Manager",
            "onboarding_step": "COMPLETED"
        }).execute()

        # 5. Initialize settings
        supabase.table("recruiter_settings").upsert({
            "user_id": user_id
        }).execute()

        print("\nSUCCESS!")
        print(f"Login Email: {email}")
        print(f"Login Password: {password}")
        print("Note: You can now go to the login page and use these credentials.")
        
    except Exception as e:
        print(f"Error during dummy user creation: {e}")

if __name__ == "__main__":
    create_dummy_recruiter()

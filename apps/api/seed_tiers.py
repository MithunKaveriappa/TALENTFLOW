import os
from dotenv import load_dotenv
from supabase import create_client

TIER_1_CITIES = ['bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad']
TIER_2_CITIES = ['jaipur', 'lucknow', 'nagpur', 'indore', 'thiruvananthapuram', 'kochi', 'coimbatore', 'madurai', 'mysore', 'chandigarh', 'bhopal', 'surat', 'patna', 'ranchi']

def get_city_tier(location):
    if not location:
        return "Unspecified"
    loc = location.lower()
    if any(city in loc for city in TIER_1_CITIES):
        return "Tier 1"
    if any(city in loc for city in TIER_2_CITIES):
        return "Tier 2"
    return "Tier 3"

def populate_tiers():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(url, key)
    
    profiles = supabase.table("candidate_profiles").select("user_id, location").execute()
    
    if not profiles.data:
        print("No profiles found.")
        return
        
    print(f"Processing {len(profiles.data)} profiles...")
    
    for p in profiles.data:
        tier = get_city_tier(p.get("location"))
        res = supabase.table("candidate_profiles").update({"location_tier": tier}).eq("user_id", p["user_id"]).execute()
        print(f"Updated {p['user_id']} ({p.get('location')}) -> {tier}")

if __name__ == "__main__":
    populate_tiers()

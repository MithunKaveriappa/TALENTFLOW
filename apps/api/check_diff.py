import asyncio
import json
from src.core.supabase import async_supabase as supabase

async def check_questions():
    res = await supabase.table("assessment_questions").select("category, experience_band").execute()
    counts = {}
    for r in (res.data or []):
        key = f"{r['category']}_{r['experience_band']}"
        counts[key] = counts.get(key, 0) + 1
    
    print("--- Question Counts per Category_Band ---")
    print(json.dumps(counts, indent=2))
    print(f"Total Questions: {len(res.data) if res.data else 0}")

if __name__ == "__main__":
    asyncio.run(check_questions())

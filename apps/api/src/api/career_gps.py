from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.core.supabase import supabase
from pydantic import BaseModel
from src.services.career_gps_service import CareerGPSService
from src.services.notification_service import NotificationService
from typing import List, Optional, Union

router = APIRouter(prefix="/candidate/career-gps", tags=["career_gps"])

class GPSInput(BaseModel):
    target_role: str
    career_interests: Union[str, List[str]]
    long_term_goal: str

class MilestoneUpdate(BaseModel):
    status: str

@router.get("/")
def get_gps_path(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    try:
        # Fetch GPS parent and milestones
        gps_res = supabase.table("career_gps").select("*").eq("candidate_id", user_id).execute()
        
        if not gps_res.data:
            return {"status": "no_gps_found"}
            
        gps_id = gps_res.data[0]["id"]
        milestones_res = supabase.table("career_milestones").select("*").eq("gps_id", gps_id).order("step_order", desc=False).execute()
        
        return {
            "status": "active",
            "gps": gps_res.data[0],
            "milestones": milestones_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_gps(request: GPSInput, user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    try:
        result = await CareerGPSService.generate_gps(user_id, request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/milestone/{milestone_id}")
def update_milestone_status(
    milestone_id: str, 
    request: MilestoneUpdate, 
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        # Verify ownership (via GPS ID and candidate ID relation)
        check = supabase.table("career_milestones")\
            .select("gps_id")\
            .eq("id", milestone_id)\
            .execute()
            
        if not check.data:
            raise HTTPException(status_code=404, detail="Milestone not found")
            
        gps_id = check.data[0]["gps_id"]
        owner_check = supabase.table("career_gps")\
            .select("candidate_id")\
            .eq("id", gps_id)\
            .execute()
            
        if not owner_check.data or owner_check.data[0]["candidate_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access")

        updates = {"status": request.status}
        if request.status == "completed":
            updates["completed_at"] = "now()"
            
            # 3. Trigger Notification
            milestone_res = supabase.table("career_milestones").select("title").eq("id", milestone_id).single().execute()
            if milestone_res.data:
                NotificationService.create_notification(
                    user_id=user_id,
                    type="system",
                    title="Milestone Completed! 🚀",
                    message=f"Congratulations! You've unlocked the '{milestone_res.data['title']}' milestone in your Career GPS.",
                    metadata={"milestone_id": milestone_id, "action": "gps_update"}
                )
        else:
            updates["completed_at"] = None
            
        supabase.table("career_milestones").update(updates).eq("id", milestone_id).execute()
        
        return {"status": "updated", "new_status": request.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

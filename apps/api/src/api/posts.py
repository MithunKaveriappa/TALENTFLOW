from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.core.supabase import supabase
from src.schemas.posts import PostCreate, PostResponse, PostAuthor, FollowRequest
from typing import List
from uuid import UUID
import json

router = APIRouter(tags=["posts"])

@router.post("", response_model=PostResponse)
def create_post(
    request: PostCreate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    post_data = {
        "user_id": user_id,
        "content": request.content,
        "media_urls": request.media_urls,
        "type": request.type
    }
    
    try:
        res = supabase.table("posts").insert(post_data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feed", response_model=List[PostResponse])
def get_feed(
    user: dict = Depends(get_current_user)
):
    current_user_id = user["sub"]
    
    try:
        # Fetch posts
        posts_res = supabase.table("posts").select("*").order("created_at", desc=True).limit(50).execute()
        posts = posts_res.data
        
        # Get all user IDs involved
        author_ids = list(set([p["user_id"] for p in posts]))
        
        # Fetch user info (role)
        users_res = supabase.table("users").select("id, role").in_("id", author_ids).execute()
        users_map = {u["id"]: u["role"] for u in users_res.data}
        
        # Fetch candidate profiles
        candidate_ids = [uid for uid, role in users_map.items() if role == "candidate"]
        candidates_res = supabase.table("candidate_profiles").select("user_id, full_name, profile_photo_url").in_("user_id", candidate_ids).execute()
        candidates_map = {c["user_id"]: c for c in candidates_res.data}
        
        # Fetch recruiter profiles
        recruiter_ids = [uid for uid, role in users_map.items() if role == "recruiter"]
        recruiters_res = supabase.table("recruiter_profiles").select("user_id, full_name").in_("user_id", recruiter_ids).execute()
        recruiters_map = {r["user_id"]: r for r in recruiters_res.data}
        
        # Fetch following status
        followed_res = supabase.table("follows").select("following_id").eq("follower_id", current_user_id).execute()
        followed_ids = set([f["following_id"] for f in followed_res.data])
        
        # Enrich posts
        enriched_posts = []
        for post in posts:
            author_id = post["user_id"]
            role = users_map.get(author_id, "unknown")
            
            author_info = {
                "id": author_id,
                "role": role,
            }
            
            if role == "candidate" and author_id in candidates_map:
                author_info["full_name"] = candidates_map[author_id].get("full_name")
                author_info["profile_photo_url"] = candidates_map[author_id].get("profile_photo_url")
            elif role == "recruiter" and author_id in recruiters_map:
                author_info["full_name"] = recruiters_map[author_id].get("full_name")
            
            post["author"] = author_info
            post["is_following"] = author_id in followed_ids
            enriched_posts.append(post)
            
        return enriched_posts
    except Exception as e:
        print(f"Error fetching feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: UUID,
    request: PostCreate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        # Verify ownership
        post = supabase.table("posts").select("user_id").eq("id", str(post_id)).execute()
        if not post.data or post.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this post")
            
        res = supabase.table("posts").update({
            "content": request.content,
            "media_urls": request.media_urls,
            "updated_at": "now()"
        }).eq("id", str(post_id)).execute()
        
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{post_id}")
def delete_post(
    post_id: UUID,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        # Verify ownership
        post = supabase.table("posts").select("user_id").eq("id", str(post_id)).execute()
        if not post.data or post.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
            
        supabase.table("posts").delete().eq("id", str(post_id)).execute()
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/follow")
def follow_user(
    request: FollowRequest,
    user: dict = Depends(get_current_user)
):
    follower_id = user["sub"]
    following_id = str(request.following_id)
    
    if follower_id == following_id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
        
    try:
        supabase.table("follows").insert({
            "follower_id": follower_id,
            "following_id": following_id
        }).execute()
        return {"status": "followed"}
    except Exception as e:
        # Handle duplicates gracefully
        return {"status": "already_following"}

@router.delete("/unfollow/{following_id}")
def unfollow_user(
    following_id: str,
    user: dict = Depends(get_current_user)
):
    follower_id = user["sub"]
    
    try:
        supabase.table("follows").delete().eq("follower_id", follower_id).eq("following_id", following_id).execute()
        return {"status": "unfollowed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

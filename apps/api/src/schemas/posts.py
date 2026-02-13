from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class PostCreate(BaseModel):
    content: str
    media_urls: List[str] = []
    type: str = "post"

class PostAuthor(BaseModel):
    id: UUID
    full_name: Optional[str] = "Anonymous"
    role: str
    profile_photo_url: Optional[str] = None

class PostResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    media_urls: List[str]
    type: str
    created_at: datetime
    author: Optional[PostAuthor] = None
    is_following: bool = False

class FollowRequest(BaseModel):
    following_id: UUID

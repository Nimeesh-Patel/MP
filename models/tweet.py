from pydantic import BaseModel
from typing import List
from datetime import datetime

class Comment(BaseModel):
    user_id: str
    username: str
    content: str
    created_at: datetime = datetime.utcnow()

class TweetCreate(BaseModel):
    content: str

class Tweet(BaseModel):
    id: str
    user_id: str
    username: str
    content: str
    created_at: datetime = datetime.utcnow()
    likes: List[str] = []        # user_ids
    dislikes: List[str] = []     # user_ids
    comments: List[Comment] = []

    class Config:
        orm_mode = True

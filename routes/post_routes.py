# routes/post_routes.py
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from database.mongo import posts_collection, comments_collection
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/posts", tags=["Posts"])

class PostIn(BaseModel):
    text: str
    image: Optional[str] = None
    userId: str
    username: str
    email: str
    avatar: Optional[str] = None

@router.post("/")
async def create_post(post: PostIn):
    new_post = {
        "text": post.text,
        "image": post.image,
        "userId": post.userId,
        "username": post.username,
        "email": post.email,
        "avatar": post.avatar,
        "createdAt": datetime.utcnow()
    }
    result = await posts_collection.insert_one(new_post)
    new_post["_id"] = str(result.inserted_id)
    return new_post

@router.get("/")
async def get_all_posts():
    posts = await posts_collection.find().sort("createdAt", -1).to_list(None)
    for p in posts:
        p["_id"] = str(p["_id"])
    return posts

@router.get("/user/{user_id}")
async def get_user_posts(user_id: str):
    posts = await posts_collection.find({"userId": user_id}).sort("createdAt", -1).to_list(None)
    for p in posts:
        p["_id"] = str(p["_id"])
    return posts

@router.get("/{post_id}")
async def get_post(post_id: str):
    try:
        post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post id")
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post["_id"] = str(post["_id"])
    return post

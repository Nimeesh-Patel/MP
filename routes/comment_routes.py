# routes/comment_routes.py
from fastapi import APIRouter, HTTPException
from database.mongo import posts_collection, comments_collection, user_collection
from bson import ObjectId
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/comments", tags=["Comments"])

class CommentIn(BaseModel):
    postId: str
    text: str
    userId: str
    parentReplyId: Optional[str] = None
    tag: Optional[str] = None 

@router.post("/")
async def add_comment(comment: CommentIn):
    # Fetch user info first
    try:
        user = await user_collection.find_one({"_id": ObjectId(comment.userId)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Case 1: Reddit posts (id starts with "reddit_")
    if comment.postId.startswith("reddit_"):
        new_comment = {
            "postId": comment.postId,
            "text": comment.text,
            "tag": comment.tag,
            "parentReplyId": comment.parentReplyId,
            "userId": comment.userId,
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("profile_photo"),
            "createdAt": datetime.utcnow()
        }
        result = await comments_collection.insert_one(new_comment)
        new_comment["_id"] = str(result.inserted_id)
        return new_comment

    # ✅ Case 2: User-created posts in Mongo
    try:
        post = await posts_collection.find_one({"_id": ObjectId(comment.postId)})
    except:
        # ✅ Case 3: If it's a reply to another comment (comment as post)
        try:
            parent_comment = await comments_collection.find_one({"_id": ObjectId(comment.postId)})
            if not parent_comment:
                raise HTTPException(status_code=404, detail="Post or comment not found")
        except:
            raise HTTPException(status_code=400, detail="Invalid post id")

    new_comment = {
        "postId": comment.postId,
        "text": comment.text,
        "tag": comment.tag,
        "parentReplyId": comment.parentReplyId,
        "userId": comment.userId,
        "username": user["username"],
        "email": user["email"],
        "avatar": user.get("profile_photo"),
        "createdAt": datetime.utcnow()
    }
    result = await comments_collection.insert_one(new_comment)
    new_comment["_id"] = str(result.inserted_id)
    return new_comment

@router.get("/by-user/{user_id}")
async def get_user_comments(user_id: str):
    comments = await comments_collection.find({"userId": user_id}).sort("createdAt", -1).to_list(None)
    for c in comments:
        c["_id"] = str(c["_id"])
    return comments

@router.get("/by-post/{post_id}")
async def get_post_comments(post_id: str):
    # Get all comments for this post (could be a regular post or a comment acting as a post)
    comments = await comments_collection.find({"postId": post_id}).sort("createdAt", -1).to_list(None)
    for c in comments:
        c["_id"] = str(c["_id"])
    return comments

@router.get("/{comment_id}")
async def get_comment(comment_id: str):
    try:
        comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid comment id")
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment["_id"] = str(comment["_id"])
    return comment
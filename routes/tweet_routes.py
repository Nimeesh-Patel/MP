from fastapi import APIRouter, Depends, HTTPException, status
from models.tweet import TweetCreate, Tweet
from database.mongo import tweet_collection, user_collection
from auth.deps import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/tweets", tags=["Tweets"])  # ✅ Declare once

@router.post("/")
async def create_tweet(tweet: TweetCreate, current_user=Depends(get_current_user)):
    tweet_data = {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "content": tweet.content,
        "created_at": datetime.utcnow(),
        "likes": [],
        "dislikes": [],
        "comments": []
    }

    result = await tweet_collection.insert_one(tweet_data)

    await user_collection.update_one(
        {"_id": current_user["_id"]},
        {"$push": {"tweets": {"id": str(result.inserted_id), "content": tweet.content}}}
    )

    return {"message": "Tweet posted successfully", "tweet_id": str(result.inserted_id)}

@router.get("/")
async def get_all_tweets(limit: int = 10):
    cursor = tweet_collection.find({}, {"_id": 0}).limit(limit)
    tweets = await cursor.to_list(length=limit)
    return {"tweets": tweets}

@router.post("/{tweet_id}/like")
async def like_tweet(tweet_id: str, current_user=Depends(get_current_user)):
    await tweet_collection.update_one(
        {"_id": ObjectId(tweet_id)},
        {"$addToSet": {"likes": str(current_user["_id"])}, "$pull": {"dislikes": str(current_user["_id"])}}
    )
    return {"message": "Tweet liked"}

@router.post("/{tweet_id}/dislike")
async def dislike_tweet(tweet_id: str, current_user=Depends(get_current_user)):
    await tweet_collection.update_one(
        {"_id": ObjectId(tweet_id)},
        {"$addToSet": {"dislikes": str(current_user["_id"])}, "$pull": {"likes": str(current_user["_id"])}}
    )
    return {"message": "Tweet disliked"}

@router.post("/{tweet_id}/comment")
async def comment_on_tweet(tweet_id: str, comment: dict, current_user=Depends(get_current_user)):
    comment_data = {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "content": comment["content"],
        "created_at": datetime.utcnow()
    }

    await tweet_collection.update_one(
        {"_id": ObjectId(tweet_id)},
        {"$push": {"comments": comment_data}}
    )

    return {"message": "Comment added"}

@router.get("/user/{user_id}")
async def get_user_tweets(user_id: str):
    tweets = await tweet_collection.find({"user_id": user_id}).to_list(length=100)
    for tweet in tweets:
        tweet["id"] = str(tweet["_id"])
    return tweets

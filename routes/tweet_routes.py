from fastapi import APIRouter
from database.mongo import tweet_collection

router = APIRouter()

@router.get("/tweets")
async def get_all_tweets(limit: int = 10):
    cursor = tweet_collection.find({}, {"_id": 0}).limit(limit)
    tweets = await cursor.to_list(length=limit)
    return {"tweets": tweets}

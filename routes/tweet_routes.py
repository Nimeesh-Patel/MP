from fastapi import APIRouter
from database.mongo import tweet_collection

router = APIRouter()
@router.get("/tweets")
async def get_all_tweets():
    cursor = tweet_collection.find({}, {"_id": 0})
    tweets = await cursor.to_list()
    return {"tweets": tweets}

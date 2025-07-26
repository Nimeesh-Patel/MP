# routes/fakenews_routes.py

from fastapi import APIRouter
from database.mongo import fakenews_collection
router = APIRouter()

@router.get("/fakenews")
async def get_fake_news_images(limit: int = 10):
    """
    Returns only image URLs from the fakeNews_collection.
    """
    cursor = fakenews_collection.find({}, {"_id": 0, "imageUrl": 1}).limit(limit)
    results = await cursor.to_list(length=limit)
    # Extract just the URLs from the documents
    image_urls = [doc["imageUrl"] for doc in results]
    return {"images": image_urls}

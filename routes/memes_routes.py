# routes/memes_routes.py
from fastapi import APIRouter
from database.mongo import memes_collection

router = APIRouter()

@router.get("/memes")
async def get_hateful_memes():
    """
    Returns only image URLs from the hateful_memes collection.
    Follows same pattern as /fakenews endpoint.
    """
    cursor = memes_collection.find({}, {"_id": 0, "imageUrl": 1})
    results = await cursor.to_list()
    # Extract just the URLs from the documents
    image_urls = [doc["imageUrl"] for doc in results]
    return {"images": image_urls}
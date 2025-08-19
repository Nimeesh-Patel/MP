from fastapi import APIRouter, HTTPException
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
# NEWS_API_URL = "https://newsapi.org/v2/top-headlines"

@router.get("/news")
async def get_news():
    params = {
        "q": "technology OR AI",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 5,
        "apiKey": NEWS_API_KEY
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://newsapi.org/v2/everything", params=params)
            news = response.json()

            if news.get("status") != "ok":
                raise HTTPException(status_code=500, detail="Error fetching news")

            return {"headlines": news["articles"]}

    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
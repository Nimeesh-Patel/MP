# services/news_fetcher.py

import httpx
import asyncio
from sockets.manager import manager

NEWS_API_KEY = "70ff1dc5c7de4afba46245f632e82e33"
NEWS_API_URL = f"https://newsapi.org/v2/everything?q=technology OR social%20media OR web%20development&sortBy=publishedAt&apiKey={NEWS_API_KEY}"

async def fetch_and_broadcast_news():
    seen_titles = set()

    while True:
        async with httpx.AsyncClient() as client:
            response = await client.get(NEWS_API_URL)
            data = response.json()

            for article in data.get("articles", []):
                if article["title"] in seen_titles:
                    continue
                seen_titles.add(article["title"])

                news_data = {
                    "type": "news",
                    "title": article["title"],
                    "description": article["description"],
                    "url": article["url"],
                    "image": article["urlToImage"],
                    "published_at": article["publishedAt"],
                    "source": article["source"]["name"]
                }

                await manager.broadcast(news_data)

        await asyncio.sleep(90)  # fetch every 1.5 minutes

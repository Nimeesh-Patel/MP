from fastapi import APIRouter
import requests

router = APIRouter()

REDDIT_ENDPOINTS = [
    "https://www.reddit.com/hot.json",
    "https://www.reddit.com/new.json",
    "https://www.reddit.com/top.json",
    "https://www.reddit.com/rising.json",
]

HEADERS = {"User-Agent": "MyRedditApp/0.0.1"}  # Reddit requires User-Agent


@router.get("/reddit")
def get_reddit_posts(limit: int = 10):
    all_posts = []

    for endpoint in REDDIT_ENDPOINTS:
        try:
            response = requests.get(f"{endpoint}?limit={limit}", headers=HEADERS, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Extract posts
            posts = [
                {
                    "id": item["data"]["id"],
                    "title": item["data"]["title"],
                    "author": item["data"]["author"],
                    "subreddit": item["data"]["subreddit"],
                    "url": item["data"].get("url"),
                    "thumbnail": item["data"].get("thumbnail"),
                    "created_utc": item["data"]["created_utc"],
                    "score": item["data"]["score"],
                    "num_comments": item["data"]["num_comments"],
                    "permalink": f"https://www.reddit.com{item['data']['permalink']}",
                    "source": endpoint.split("/")[-1].replace(".json", ""),  # hot/new/top/rising
                }
                for item in data["data"]["children"]
            ]

            all_posts.extend(posts)

        except Exception as e:
            print(f"Error fetching {endpoint}: {e}")

    return {"posts": all_posts}

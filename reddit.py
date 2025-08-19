from fastapi import APIRouter, HTTPException, Query
import praw
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Initialize Reddit API via PRAW
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent="misinfo-detector"
)

# Subreddits to monitor (you can add/remove based on politics/misinformation relevance)
TARGET_SUBS = "IndiaPolitics+IndiaSpeaks+Chodi+Indianews+PoliticalHumor"


@router.get("/reddit")
async def get_reddit_posts(
    limit: int = Query(10, ge=1, le=50),  # number of posts per subreddit
    sort: str = Query("hot", regex="^(hot|new|top|rising)$")  # sorting method
):
    try:
        posts = []
        subreddit = reddit.subreddit(TARGET_SUBS)

        # Choose sorting logic
        if sort == "hot":
            submissions = subreddit.hot(limit=limit)
        elif sort == "new":
            submissions = subreddit.new(limit=limit)
        elif sort == "top":
            submissions = subreddit.top(limit=limit)
        elif sort == "rising":
            submissions = subreddit.rising(limit=limit)

        # Extract relevant info
        for post in submissions:
            posts.append({
                "id": post.id,
                "title": post.title,
                "author": str(post.author),
                "subreddit": post.subreddit.display_name,
                "text": post.selftext if post.selftext else None,  # post body (useful for NLP)
                "url": post.url,  # external link (news, image, etc.)
                "is_self": post.is_self,  # True if it's a text post
                "created_utc": post.created_utc,
                "score": post.score,
                "num_comments": post.num_comments,
                "permalink": f"https://www.reddit.com{post.permalink}"
            })

        return {"posts": posts, "count": len(posts)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

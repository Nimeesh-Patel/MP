import praw
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Reddit client
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent="misinfo-detector"
)

# Fetch posts
def fetch_reddit_posts():
    posts = []
    subreddit = reddit.subreddit("IndiaPolitics+IndiaSpeaks+Chodi")  # multiple subs

    for post in subreddit.hot(limit=10):  # top 10 hot posts
        posts.append({
            "title": post.title,
            "text": post.selftext,
            "url": post.url,
            "score": post.score,
            "created_utc": post.created_utc,
            "num_comments": post.num_comments
        })

    return posts

if __name__ == "__main__":
    reddit_posts = fetch_reddit_posts()
    for i, post in enumerate(reddit_posts, 1):
        print(f"\nPost {i}:")
        print(f"Title: {post['title']}")
        print(f"URL: {post['url']}")
        print(f"Score: {post['score']} | Comments: {post['num_comments']}")
        print(f"Text: {post['text'][:200]}...")  # preview first 200 chars

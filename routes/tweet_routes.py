# routes/tweet_routes.py
from fastapi import APIRouter
import pandas as pd

router = APIRouter()

# Load your dataset (adjust the path and column names)
df = pd.read_csv("tweets.csv")  # or .xlsx with read_excel()

@router.get("/tweets")
def get_all_tweets():
    tweets = []
    for _, row in df.iterrows():
        tweets.append({
            "username": row.get("Username", "@anonymous"),
            "text": row.get("TWEET", "No content")
        })
    return {"tweets": tweets}

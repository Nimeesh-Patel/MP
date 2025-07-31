import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB Atlas using environment variable
MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise ValueError("MONGO_URL environment variable not set")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
print("Connected to MongoDB successfully ")

# Use 'major_project_db' database
db = client["major_project_db"]

# Collections
tweet_collection = db.get_collection("tweets_collection")
fakenews_collection = db.get_collection("fakeNews_images")
memes_collection = db.get_collection("hateful_memes")
user_collection = db.get_collection("users")

# Optional helper
def get_db():
    return db

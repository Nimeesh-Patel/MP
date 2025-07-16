# database/mongo.py

import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB Atlas using environment variable
client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URL"))

# Use 'tweet_db' database
db = client["major_project_db"]

# Use 'tweets_collection' collection
tweet_collection = db.get_collection("tweets_collection")
user_collection = db.get_collection("users")
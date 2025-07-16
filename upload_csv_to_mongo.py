# upload_csv_to_mongo.py

import pandas as pd
from pymongo import MongoClient

# Replace with your actual connection string
client = MongoClient("mongodb+srv://chourikar31:Atharva@cluster0.ac0teqc.mongodb.net/misinfo_detect?retryWrites=true&w=majority")

# Access database and collection
db = client["major_project_db"]              # database name
collection = db["tweets_collection"] # collection name

# Read CSV
df = pd.read_csv("tweets.csv")

# Convert DataFrame to list of dictionaries
data = df.to_dict(orient="records")

# Optional: Clean column names (e.g., "TWEET" → "text", "Username" → "username")
for doc in data:
    doc["username"] = doc.pop("Username", "@anonymous")
    doc["text"] = doc.pop("TWEET", "No content")

# Insert into MongoDB
collection.insert_many(data)

print("✅ Upload complete!")

import os
import cloudinary
import cloudinary.uploader
from pymongo import MongoClient
from pathlib import Path
from datetime import datetime
import time

# 1. Configure your settings here (EDIT THESE)
CONFIG = {
    "CLOUDINARY": {
        "cloud_name": "dv42ncrzw",
        "api_key": "612542424679259",
        "api_secret": "ox0fN7OrR3QNyAbg5k80W3S8Nps"
    },
    "MONGO_URI": "mongodb+srv://chourikar31:Atharva@cluster0.ac0teqc.mongodb.net/",  # Your MongoDB connection string
    "DATABASE": "major_project_db",            # Your database name
    "COLLECTION": "hateful_memes",             # Collection name
    "DATASET_PATH": "D:\data\img",  # ABSOLUTE path to your images
    "BATCH_SIZE": 30                           # Images per batch
}

# 2. Setup connections
cloudinary.config(**CONFIG["CLOUDINARY"])
mongo_client = MongoClient(CONFIG["MONGO_URI"])
db = mongo_client[CONFIG["DATABASE"]]
collection = db[CONFIG["COLLECTION"]]

def upload_images():
    """Standalone uploader for hateful memes dataset"""
    folder = Path(CONFIG["DATASET_PATH"])
    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")

    image_files = [
        f for f in folder.iterdir() 
        if f.is_file() and f.suffix.lower() in ['.jpg','.jpeg','.png','.gif']
    ]

    print(f"🚀 Found {len(image_files)} images in {folder}")

    for i, image_file in enumerate(image_files, 1):
        try:
            # Skip if already uploaded
            if collection.count_documents({"originalName": image_file.name}) > 0:
                print(f"⏩ Already exists: {image_file.name}")
                continue

            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                str(image_file),
                folder="hateful_memes",
                use_filename=True,
                timeout=30
            )

            # Store in MongoDB
            collection.insert_one({
                "imageUrl": result['secure_url'],
                "publicId": result['public_id'],
                "originalName": image_file.name,
                "uploadedAt": datetime.now()
            })

            print(f"✅ [{i}/{len(image_files)}] Uploaded {image_file.name}")

            # Pause between batches
            if i % CONFIG["BATCH_SIZE"] == 0:
                time.sleep(2)

        except Exception as e:
            print(f"❌ Failed {image_file.name}: {str(e)}")
            continue

    print(f"\n🔥 Upload complete! Processed {len(image_files)} images")

if __name__ == "__main__":
    upload_images()
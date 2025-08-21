from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.user import UserLogin
from database.mongo import user_collection, posts_collection
from auth.utils import hash_password, verify_password, create_access_token
import os
from uuid import uuid4
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/register")
async def register(
    name: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    profile_photo: UploadFile = File(None)
):
    # check if email already exists
    existing_user = await user_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    photo_url = None
    if profile_photo:
        # Save uploaded file
        ext = os.path.splitext(profile_photo.filename)[-1]
        filename = f"{uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(await profile_photo.read())
        photo_url = f"/uploads/{filename}"  # accessible via StaticFiles

    # Prepare user data
    user_data = {
        "name": name,
        "email": email,
        "username": username,
        "password": hash_password(password),
        "profile_photo": photo_url,
        "tweets": [],  # initialize empty tweet list
    }

    result = await user_collection.insert_one(user_data)
    return {"message": "User registered successfully", "userId": str(result.inserted_id)}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await user_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user["email"], "id": str(db_user["_id"])})

    return {
        "access_token": token,
        "token_type": "bearer",
        "userId": str(db_user["_id"]),
        "name": db_user["name"],
        "username": db_user["username"],
        "email": db_user["email"],
        "profile_photo": db_user.get("profile_photo")
    }

@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    try:
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Fetch posts created by this user
    posts = await posts_collection.find({"userId": user_id}).sort("createdAt", -1).to_list(None)
    for p in posts:
        p["_id"] = str(p["_id"])

    return {
        "user": {
            "name": user["name"],
            "username": user["username"],
            "email": user["email"],
            "profile_photo": user.get("profile_photo")
        },
        "posts": posts
    }
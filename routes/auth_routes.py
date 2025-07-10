# routes/auth_routes.py
from fastapi import APIRouter, HTTPException, status
from models.user import UserRegister, UserLogin
from database.mongo import user_collection
from auth.utils import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)

    await user_collection.insert_one(user_data)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await user_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user["email"]})
    return {"access_token": token, "token_type": "bearer"}

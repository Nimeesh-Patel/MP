from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from auth.utils import decode_token
from database.mongo import user_collection
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    user = await user_collection.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

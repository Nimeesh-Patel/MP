from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str  # Add this field
    profile_photo: Optional[str] = None  # Add this field

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# class CommentCreate(BaseModel):
#     postId: str
#     text: str
#     parentReplyId: Optional[str] = None
#     userId: str
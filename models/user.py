from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserTweet(BaseModel):
    id: str
    content: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    tweets: List[UserTweet] = []

    class Config:
        orm_mode = True

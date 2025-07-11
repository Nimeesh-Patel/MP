from pydantic import BaseModel
from typing import Optional

class Idea(BaseModel):
    id: int
    title: str
    body: str
    idea_type: str
    parent_id: Optional[int] = None

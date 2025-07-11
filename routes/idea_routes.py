from fastapi import APIRouter, HTTPException
from typing import List
from models.idea import Idea

router = APIRouter()

# In-memory storage
ideas: List[Idea] = []
current_id = 1

@router.get('/ideas', response_model=List[Idea])
async def list_ideas():
    return ideas

@router.post('/ideas', response_model=Idea)
async def create_idea(idea: Idea):
    global current_id
    idea.id = current_id
    current_id += 1
    ideas.append(idea)
    return idea

@router.get('/ideas/{idea_id}', response_model=Idea)
async def get_idea(idea_id: int):
    for idea in ideas:
        if idea.id == idea_id:
            return idea
    raise HTTPException(status_code=404, detail='Idea not found')

@router.post('/ideas/{idea_id}/criticize', response_model=Idea)
async def add_criticism(idea_id: int, idea: Idea):
    idea.parent_id = idea_id
    idea.idea_type = 'criticism'
    return await create_idea(idea)

@router.post('/ideas/{idea_id}/synthesize', response_model=Idea)
async def add_synthesis(idea_id: int, idea: Idea):
    idea.parent_id = idea_id
    idea.idea_type = 'synthesis'
    return await create_idea(idea)

@router.post('/ideas/{idea_id}/fork', response_model=Idea)
async def fork_idea(idea_id: int, idea: Idea):
    idea.parent_id = idea_id
    idea.idea_type = 'conjecture'
    return await create_idea(idea)

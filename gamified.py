from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

class ExplanationRequest(BaseModel):
    content: str  # Tweet text or image URL
    model_prediction: str
    content_type: str  # "tweet", "image", or "meme"

def get_image_data(url):
    """Fetch image and return base64 encoded data with mime type"""
    response = requests.get(url)
    response.raise_for_status()
    
    # Determine mime type from content-type header or file extension
    content_type = response.headers.get('content-type', 'image/jpeg')
    if ';' in content_type:
        content_type = content_type.split(';')[0]
    
    return {
        "mime_type": content_type,
        "data": base64.b64encode(response.content).decode('utf-8')
    }

@app.post("/generate-explanation")
async def explain_prediction(request: ExplanationRequest):
    try:
        if request.content_type == "tweet":
            # Text-only analysis using gemini-1.5-flash
            model = "gemini-2.5-pro"
            parts = [{"text": f"""Analyze this tweet classified as {request.model_prediction}:
                    Content: \"\"\"{request.content}\"\"\"
                    
                    Identify specific elements that justify this classification.
                    Provide a concise 1-2 sentence explanation."""}]
        else:
            # Multimodal analysis using gemini-1.5-pro
            model = "gemini-2.5-pro"
            image_data = get_image_data(request.content)
            parts = [
                {"text": f"""Analyze this {request.content_type} classified as {request.model_prediction}.
                Identify visual/textual elements that justify this classification in 2-3 lines.
                Focus on: {'signs of manipulation' if request.model_prediction == 'fake' else 'offensive content'}"""},
                {
                    "inline_data": {
                        "mime_type": image_data["mime_type"],
                        "data": image_data["data"]
                    }
                }
            ]

        endpoint = f"{BASE_URL}/{model}:generateContent?key={API_KEY}"
        
        response = requests.post(
            endpoint,
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": parts}]},
            timeout=60
        )
        
        result = response.json()
        print("Gemini API response:", result)  # For debugging
        if response.status_code == 200:
            try:
                explanation = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {"explanation": explanation}
            except (KeyError, IndexError, TypeError):
                return {"explanation": f"Unexpected Gemini response: {result}"}
        else:
            error_msg = result.get('error', {}).get('message', 'Unknown error')
            return {"explanation": f"Gemini API Error: {error_msg}. Full response: {result}"}
    
    except requests.exceptions.RequestException as e:
        return {"explanation": f"Image download failed: {str(e)}"}
    except Exception as e:
        return {"explanation": f"Processing Error: {str(e)}"}
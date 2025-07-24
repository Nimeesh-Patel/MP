from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env


app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace with your Gemini API Key or set as env variable
API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

class TweetText(BaseModel):
    text: str

@app.post("/analyze-intention")
def analyze_intention(tweet: TweetText):
    prompt = f"""
Analyze the following content and form a theory about the intention of the person behind it through Popperian epistemology and Deutschian Explanation. Keep your explanations concise, precise, and pithy.

Template:
"[the 'unit vector description' of the intention (good, bad, regressive, open, closed, etc)] + intention: [your explanation of 10 words more or less regarding that]"

Text:
\"\"\"{tweet.text}\"\"\"
"""

    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(GEMINI_URL, headers=headers, data=json.dumps(data), timeout=60)

        if response.status_code == 200:
            result = response.json()
            llm_response = result["candidates"][0]["content"]["parts"][0]["text"]
            return {"label": llm_response.strip()}

        return {"label": f"Gemini Error: {response.status_code} - {response.text}"}

    except Exception as e:
        return {"label": f"Internal Error: {str(e)}"}

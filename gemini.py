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
Read the following content with a fallibilist lens.
Your task is to extract all distinct ideas, conjectures, or criticisms from the text — even if they’re mixed with emotional or messy language.

For each idea you identify:

1. Strip away emotional bias, hate speech, or insults.
2. Restate the idea as a clear conjecture, criticism, or general claim, using roughly the same number of words.
3. If multiple separate claims exist, list them separately.

💡 Be bold: even rants or offensive statements can hide real testable theories.
❌ Do not include surface-level noise or name-calling.
✅ Focus on clarity and truth-seeking.

Output format:

criticism: [restated claim 1]  
criticism: [restated claim 2]  
conjecture/idea: [restated claim 3, etc.]

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

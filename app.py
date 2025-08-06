from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import BertTokenizer, BertForSequenceClassification
import torch

# ✅ Routers
from routes.auth_routes import router as AuthRouter
from routes.tweet_routes import router as TweetRouter
from routes.news import router as NewsRouter

# ✅ FastAPI app initialization
app = FastAPI()

# ✅ Enable CORS (for frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set allowed domains only
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load BERT model and tokenizer
model_path = "bert_model"  # Make sure this folder contains config.json, pytorch_model.bin, vocab.txt, etc.
tokenizer = BertTokenizer.from_pretrained(model_path)
model = BertForSequenceClassification.from_pretrained(model_path)
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# ✅ Define request schema
class TweetText(BaseModel):
    text: str

# ✅ Register routers
app.include_router(AuthRouter)
app.include_router(TweetRouter)
app.include_router(NewsRouter)

# ✅ Prediction endpoint
@app.post("/predict")
def predict_tweet(tweet: TweetText):
    inputs = tokenizer(tweet.text, return_tensors="pt", padding=True, truncation=True).to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()

    label_map = {
        0: "Hate Speech",
        1: "Offensive",
        2: "Neither"
    }

    return {"label": label_map.get(prediction, "Unknown")}

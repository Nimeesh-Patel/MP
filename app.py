from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from routes.auth_routes import router as AuthRouter
from routes.idea_routes import router as IdeaRouter
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and tokenizer
model_path = "bert_model"  # make sure this is your correct folder name
tokenizer = BertTokenizer.from_pretrained(model_path)
model = BertForSequenceClassification.from_pretrained(model_path)
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Input format
class TweetText(BaseModel):
    text: str

# Prediction endpoint

app.include_router(AuthRouter)
app.include_router(IdeaRouter)
@app.post("/predict")
def predict_tweet(tweet: TweetText):
    inputs = tokenizer(tweet.text, return_tensors="pt", padding=True, truncation=True).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()

    # ✅ Fix: Match training labels
    label_map = {
        0: "Hate Speech",
        1: "Offensive",
        2: "Neither"
    }

    return {"label": label_map.get(prediction, "Unknown")}

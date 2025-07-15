from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import BertTokenizer, BertForSequenceClassification
import torch

# ✅ Routers
from routes.auth_routes import router as AuthRouter
from routes.tweet_routes import router as TweetRouter  # ✅ Import tweet router

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load BERT model and tokenizer
model_path = "bert_model"  # Ensure this path is correct
tokenizer = BertTokenizer.from_pretrained(model_path)
model = BertForSequenceClassification.from_pretrained(model_path)
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# ✅ Pydantic model for POST /predict
class TweetText(BaseModel):
    text: str

# ✅ Include routers
app.include_router(AuthRouter)
app.include_router(TweetRouter)  # 👈 This registers /tweets endpoint

# ✅ Endpoint for prediction using BERT
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

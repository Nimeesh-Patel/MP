from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from fastapi.staticfiles import StaticFiles

# ✅ Routers
from routes.auth_routes import router as AuthRouter
from routes.tweet_routes import router as TweetRouter  # ✅ Import tweet router
from reddit import router as reddit_router
from routes.comment_routes import router as CommentRouter
from routes.post_routes import router as PostRouter

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

# Add this after creating your FastAPI app
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ Include routers
app.include_router(AuthRouter)
app.include_router(TweetRouter)  # 👈 This registers /tweets endpoint
app.include_router(reddit_router)
app.include_router(CommentRouter)
app.include_router(PostRouter)

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

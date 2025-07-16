from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
import torch.nn as nn
import torch.nn.functional as F
import pytesseract
import numpy as np
import io
import os

# Setup Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# FastAPI app
app = FastAPI(title="Fake News CLIP Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CLIP
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Classifier definition (same as your training)
classifier = nn.Sequential(
    nn.Linear(1024, 512),
    nn.ReLU(),
    nn.Linear(512, 2)
).to(device)

# Load your trained weights
classifier.load_state_dict(torch.load("../clip_models/clip_fakenews.pkl", map_location=device))
classifier.eval()

def extract_text(image_pil):
    """Extract text from image using pytesseract"""
    try:
        text = pytesseract.image_to_string(image_pil, config='--psm 6')
        return text.strip() if text.strip() else "This is a news-related post or meme."
    except Exception as e:
        return "This is a news-related post or meme."

@app.post("/predict-fakenews")
async def predict_fakenews(image: UploadFile = File(...)):
    try:
        # Read and prepare image
        image_bytes = await image.read()
        image_file = io.BytesIO(image_bytes)
        image_pil = Image.open(image_file).convert("RGB")

        # OCR
        extracted_text = extract_text(image_pil)

        # CLIP processing
        inputs = processor(
            text=extracted_text,
            images=image_pil,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(device)

        with torch.no_grad():
            image_features = clip_model.get_image_features(inputs["pixel_values"])
            text_features = clip_model.get_text_features(inputs["input_ids"])
            combined = torch.cat((image_features, text_features), dim=1)
            logits = classifier(combined)
            probs = F.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1).item()

        label = "real" if pred == 1 else "fake"
        confidence = round(probs[0][pred].item(), 3)

        return JSONResponse(content={
            "label": label,
            "confidence": confidence,
            "extracted_text": extracted_text
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

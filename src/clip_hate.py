from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
from transformers import CLIPProcessor, CLIPModel
import torch.nn as nn
import numpy as np
import logging
import pytesseract
import os

# Setup for Windows pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Avoid multiprocessing/threading issues
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Logger config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Hateful Meme Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Device config
device = "cpu"
logger.info(f"Using device: {device}")

# Load CLIP model and processor
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)

# Classifier head
classifier = nn.Sequential(
    nn.Linear(clip_model.config.projection_dim * 2, 512),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(512, 2),
    nn.Softmax(dim=1)
).to(device)

# Load trained weights
try:
    classifier.load_state_dict(torch.load("../clip_models/hate_classifier.pt", map_location=device))
    classifier.eval()
    logger.info("Classifier loaded successfully")
except Exception as e:
    logger.error(f"Failed to load classifier: {str(e)}")
    raise

def preprocess_image(image: UploadFile):
    try:
        contents = image.file.read()
        image_bytes = io.BytesIO(contents)
        pil_image = Image.open(image_bytes).convert("RGB")
        image.file.seek(0)  # Reset file pointer
        return pil_image
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise

def extract_text_with_ocr(pil_image):
    try:
        text = pytesseract.image_to_string(pil_image, config='--psm 6')
        return text if len(text.strip()) > 2 else "This is a social media post or meme"
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        return "This is a social media post or meme"

def predict_hateful_meme(image, text):
    try:
        inputs = processor(
            text=[text],
            images=image,
            return_tensors="pt",
            padding=True
        ).to(device)

        with torch.no_grad():
            image_features = clip_model.get_image_features(inputs["pixel_values"])
            text_features = clip_model.get_text_features(inputs["input_ids"])
            combined = torch.cat((image_features, text_features), dim=1)
            outputs = classifier(combined)
            pred = torch.argmax(outputs, dim=1).item()
            confidence = torch.max(outputs).item()

        label = "Hateful" if pred == 1 else "Neutral"
        return label, confidence
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise

@app.post("/classify")
async def classify_meme(file: UploadFile = File(...)):
    try:
        logger.info("📥 File received")
        pil_image = preprocess_image(file)
        extracted_text = extract_text_with_ocr(pil_image)
        logger.info(f"🧾 OCR Extracted: {extracted_text}")
        
        label, confidence = predict_hateful_meme(pil_image, extracted_text)
        logger.info(f"✅ Prediction: {label} ({confidence:.2f})")

        return JSONResponse(content={
            "label": label,
            "confidence": round(confidence, 4),
            "extracted_text": extracted_text
        })

    except Exception as e:
        logger.error(f"❌ API failed: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main2:app", host="127.0.0.1", port=8000, reload=True)

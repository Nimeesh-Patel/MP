from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.memes_routes import router as MemesRouter
from PIL import Image
import io
import torch
from transformers import CLIPProcessor, CLIPModel
import torch.nn as nn
import logging
import pytesseract
import os

# Setup pytesseract for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Multiprocessing/threading settings (Windows-safe)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Hateful Meme Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(MemesRouter)
# Device config
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"🖥️ Using device: {device}")

# Load CLIP model
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)

# Define classifier head
classifier = nn.Sequential(
    nn.Linear(clip_model.config.projection_dim * 2, 512),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(512, 2),
    nn.Softmax(dim=1)
).to(device)

# ✅ Load classifier weights safely with dynamic path
try:
    current_dir = os.path.dirname(__file__)
    model_path = os.path.abspath(os.path.join(current_dir, "..", "clip_models", "hate_classifier.pt"))

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")

    classifier.load_state_dict(torch.load(model_path, map_location=device))
    classifier.eval()
    logger.info(f"✅ Classifier loaded from: {model_path}")
except Exception as e:
    logger.error(f"❌ Failed to load classifier: {str(e)}")
    raise

# 🖼️ Image Preprocessing
def preprocess_image(image: UploadFile):
    try:
        contents = image.file.read()
        image_bytes = io.BytesIO(contents)
        pil_image = Image.open(image_bytes).convert("RGB")
        image.file.seek(0)  # reset pointer
        return pil_image
    except Exception as e:
        logger.error(f"❌ Image preprocessing failed: {str(e)}")
        raise

# 🧠 OCR Extraction
def extract_text_with_ocr(pil_image):
    try:
        text = pytesseract.image_to_string(pil_image, config='--psm 6')
        return text if len(text.strip()) > 2 else "This is a social media post or meme"
    except Exception as e:
        logger.error(f"❌ OCR failed: {str(e)}")
        return "This is a social media post or meme"

# 🔍 Hateful Meme Prediction
def predict_hateful_meme(image, text):
    try:
        # Truncate to fit CLIP model's limit (77 tokens max for text)
        text = text[:300]  # Reduce chance of overflow
        inputs = processor(
            text=[text],
            images=image,
            return_tensors="pt",
            padding=True,
            truncation=True
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
        logger.error(f"❌ Prediction error: {str(e)}")
        raise

# 🎯 API Endpoint
@app.post("/classify")
async def classify_meme(file: UploadFile = File(...)):
    try:
        logger.info("📥 File received for classification")
        pil_image = preprocess_image(file)
        extracted_text = extract_text_with_ocr(pil_image)
        logger.info(f"🧾 OCR Extracted: {extracted_text.strip()[:80]}...")

        label, confidence = predict_hateful_meme(pil_image, extracted_text)
        logger.info(f"✅ Prediction: {label} (Confidence: {confidence:.2f})")

        return JSONResponse(content={
            "label": label,
            "confidence": round(confidence, 4),
            "extracted_text": extracted_text
        })

    except Exception as e:
        logger.error(f"❌ classify_meme failed: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

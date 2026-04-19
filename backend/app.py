import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from predict import DeepfakePredictor

app = FastAPI(
    title="Deepfake Detection API",
    description="Backend API for predicting deepfakes in images and videos",
    version="1.0.0"
)

# Setup CORS for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since you have a frontend ready, you may restrict this later to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor
# Note: It expects the model.h5 to exist inside models/. It will warn if not found.
predictor = DeepfakePredictor()

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/health")
def health_check():
    """
    Returns system status.
    """
    return {
        "status": "active",
        "model_loaded": predictor.model is not None
    }

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    """
    Endpoint: /predict-image
    Input: image file
    Output: prediction + confidence
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    temp_path = os.path.join(TEMP_DIR, file.filename)
    try:
        # Save temp file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Predict
        result = predictor.predict_image(temp_path)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...)):
    """
    Endpoint: /predict-video
    Input: video file
    Output: prediction + confidence
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    temp_path = os.path.join(TEMP_DIR, file.filename)
    try:
        # Save temp video file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Predict using frames majority voting
        result = predictor.predict_video(temp_path)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    print("Starting Deepfake Detection Backend Server...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

# VeriSynth - Deepfake Detection Platform

VeriSynth is a premium, production-grade deepfake detection platform. It uses a Next.js frontend for a seamless user experience and a FastAPI backend powered by TensorFlow and MobileNetV2 to analyze and detect manipulated media.

## Project Structure

- **`/app` & `/components`**: Next.js frontend code.
- **`/backend`**: Python FastAPI backend and TensorFlow training scripts.

---

## Getting Started

To run VeriSynth locally, you need to start both the Python backend and the Next.js frontend in separate terminal windows.

### 1. Start the Backend (API)

The backend handles the AI analysis and serves predictions to the frontend.

1. Open a new terminal.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. (Optional but recommended) Create and activate a Python virtual environment.
4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI server:
   ```bash
   python app.py
   ```
   *The backend will start running on `http://localhost:8000`.*

### 2. Start the Frontend (UI)

The frontend provides the user interface for uploading and analyzing media.

1. Open a **second** new terminal.
2. Ensure you are in the root directory of the project (where this README is located).
3. Install the Node dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will start running on `http://localhost:3000`.*

---

## Usage

1. Once both servers are running, open your web browser and navigate to: [http://localhost:3000](http://localhost:3000)
2. Go to the **Analyze** page.
3. Upload an image or video to test the deepfake detection model!

## Model Training

If you wish to retrain the model with your own dataset:
1. Place your dataset inside `backend/processed_dataset/real` and `backend/processed_dataset/fake`.
2. Run the training script:
   ```bash
   cd backend
   python train.py
   ```
3. The new model will automatically overwrite the existing one in `backend/models/deepfake_model.h5`.

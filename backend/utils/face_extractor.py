import cv2
import os
import glob
from pathlib import Path
import numpy as np
import mediapipe as mp

class FaceExtractor:
    def __init__(self, target_size=(224, 224), margin=0.2):
        """
        Initializes the face extractor using MediaPipe (primary) and OpenCV Haar Cascades (fallback) for extreme robustness.
        """
        self.target_size = target_size
        self.margin = margin

        # MediaPipe is optional in some environments; keep the OpenCV fallback usable.
        self.mp_face_detection = getattr(getattr(mp, "solutions", None), "face_detection", None)
        self.face_detection = None
        if self.mp_face_detection is not None:
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=1, min_detection_confidence=0.4
            )
        
        # Load the pre-trained Haar Cascade face detector as fallback
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def process_image(self, image_path: str, output_dir: str):
        image_name = Path(image_path).name
        image = cv2.imread(image_path)
        if image is None:
            return

        cropped_face = self.extract_face(image)
        if cropped_face is not None:
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, image_name)
            cv2.imwrite(output_path, cropped_face)

    def extract_face(self, image: np.ndarray):
        ih, iw, _ = image.shape
        
        # Attempt 1: MediaPipe (Highly Robust)
        results = None
        if self.face_detection is not None:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_detection.process(image_rgb)
        
        x, y, w, h = 0, 0, 0, 0
        face_found = False

        if results and results.detections:
            best_detection = max(results.detections, key=lambda d: d.score[0])
            bboxC = best_detection.location_data.relative_bounding_box
            x = int(bboxC.xmin * iw)
            y = int(bboxC.ymin * ih)
            w = int(bboxC.width * iw)
            h = int(bboxC.height * ih)
            face_found = True
        else:
            # Attempt 2: Haar Cascade (Fallback)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
            )
            
            # Attempt 3: Aggressive Haar Cascade
            if len(faces) == 0:
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.05, minNeighbors=2, minSize=(20, 20)
                )

            if len(faces) > 0:
                # Take largest face
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                x, y, w, h = faces[0]
                face_found = True

        if not face_found:
            return None

        # Apply margin
        x_margin = int(w * self.margin)
        y_margin = int(h * self.margin)

        x_start = max(0, x - x_margin)
        x_end = min(iw, x + w + x_margin)
        y_start = max(0, y - y_margin)
        y_end = min(ih, y + h + y_margin)

        cropped_face = image[y_start:y_end, x_start:x_end]

        # Resize to model input size (e.g., 224x224)
        if cropped_face.shape[0] > 0 and cropped_face.size > 0:
            try:
                cropped_face = cv2.resize(cropped_face, self.target_size)
                return cropped_face
            except Exception as e:
                return None
        return None

    def process_directory(self, input_dir: str, output_dir: str):
        image_files = glob.glob(os.path.join(input_dir, "*.jpg")) + glob.glob(os.path.join(input_dir, "*.png"))
        print(f"Found {len(image_files)} images in {input_dir}. Extracting faces...")
        
        processed_count = 0
        for img_path in image_files:
            self.process_image(img_path, output_dir)
            processed_count += 1
            if processed_count % 500 == 0:
                print(f"Processed {processed_count}/{len(image_files)} images...")
                
        print(f"Face extraction complete. Processed {processed_count} images.")

if __name__ == "__main__":
    pass

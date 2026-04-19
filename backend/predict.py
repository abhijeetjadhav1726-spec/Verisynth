import cv2
import numpy as np
import tensorflow as tf
import base64
import os
from pathlib import Path
from utils.face_extractor import FaceExtractor
from utils.dataset_handler import VideoProcessor
from utils.source_analyzer import SourceAnalyzer

class DeepfakePredictor:
    def __init__(self, model_path: str = "models/deepfake_model.h5"):
        self.model_path = model_path
        self.model = self._load_model()
        self.face_extractor = FaceExtractor()
        self.source_analyzer = SourceAnalyzer()
        
    def _load_model(self):
        try:
            from utils.model_builder import DeepfakeModel
            img_height, img_width = 224, 224
            
            # Rebuild exactly as training
            builder = DeepfakeModel(input_shape=(img_height, img_width, 3))
            base_model = builder.build_transfer_model(fine_tune=False)
            
            # Preprocessing is part of the model in train.py
            inputs = tf.keras.Input(shape=(img_height, img_width, 3))
            # Preprocessing: scales to [-1, 1] for MobileNetV2
            x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
            outputs = base_model(x)
            
            model = tf.keras.Model(inputs, outputs)
            
            if os.path.exists(self.model_path):
                model.load_weights(self.model_path)
                print(f"Successfully loaded model weights from {self.model_path}")
            else:
                print(f"Warning: Model weights not found at {self.model_path}")
                
            return model
        except Exception as e:
            print(f"Warning: Could not load model. Error: {e}")
            return None

    def _get_last_conv_layer(self, model):
        """Recursively find the last Conv2D layer in a model."""
        last_conv = None
        for layer in model.layers:
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv = layer
            if hasattr(layer, 'layers'):
                sub_last = self._get_last_conv_layer(layer)
                if sub_last:
                    last_conv = sub_last
        return last_conv

    def _generate_gradcam(self, input_arr, original_face_rgb):
        """
        Generate Grad-CAM heatmap overlay.
        """
        try:
            # For Grad-CAM, we need to bypass the nested models to get gradients
            # The model is: Input -> Preprocess -> Functional (base_model)
            # base_model is: Input -> MobileNetV2 -> ... -> Sigmoid
            
            # Find the transfer model layer
            base_model_layer = None
            for layer in self.model.layers:
                if isinstance(layer, tf.keras.Model) or (hasattr(layer, 'layers') and not isinstance(layer, tf.keras.Sequential)):
                    base_model_layer = layer
                    break
            
            if not base_model_layer:
                return None

            # Find last conv in base_model
            last_conv = self._get_last_conv_layer(base_model_layer)
            if not last_conv:
                return None

            # To get gradients, we need a model that takes base_model's input and outputs [conv, prediction]
            # Since base_model is functional, we can do this:
            grad_model = tf.keras.Model(
                inputs=base_model_layer.input,
                outputs=[last_conv.output, base_model_layer.output]
            )

            # Preprocess input as the model expects (it's already been preprocessed by the outer model's layer,
            # but for Grad-CAM we'll apply it manually to a fresh input for the grad_model)
            preprocessed_input = tf.keras.applications.mobilenet_v2.preprocess_input(input_arr)
            
            with tf.GradientTape() as tape:
                conv_outputs, predictions = grad_model(preprocessed_input, training=False)
                # sigmoid output is probability of Real.
                # If we want to highlight what makes it FAKE, we take gradient of (1 - predictions)
                score = predictions[:, 0]
                if score < 0.5: # If predicted Fake
                    loss = 1.0 - score
                else:
                    loss = score
            
            grads = tape.gradient(loss, conv_outputs)
            if grads is None:
                print("Grad-CAM: Gradients are None")
                return None
                
            weights = tf.reduce_mean(grads, axis=(1, 2))
            cam = tf.reduce_sum(conv_outputs * weights[:, tf.newaxis, tf.newaxis, :], axis=-1)
            cam = tf.squeeze(cam).numpy()
            
            cam = np.maximum(cam, 0)
            if cam.max() > 0:
                cam = cam / cam.max()
            
            # Overlay
            cam_resized = cv2.resize(cam, (original_face_rgb.shape[1], original_face_rgb.shape[0]))
            heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
            heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
            
            overlay = cv2.addWeighted(original_face_rgb, 0.6, heatmap, 0.4, 0)
            
            _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
            b64_string = base64.b64encode(buffer).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_string}"
            
        except Exception as e:
            print(f"Grad-CAM error: {e}")
            return None

    def predict_image(self, image_path: str):
        if not self.model:
            return {"error": "Model not loaded"}

        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Could not read image"}

        # Face extraction
        face_bgr = self.face_extractor.extract_face(image)
        if face_bgr is None:
            return {"error": "No face detected"}

        face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
        input_arr = np.expand_dims(face_rgb, axis=0).astype("float32")

        # Prediction
        prediction_score = self.model.predict(input_arr, verbose=0)[0][0]
        print(f"DEBUG: Raw model prediction for {os.path.basename(image_path)}: {prediction_score:.4f}")

        # 0 -> Fake, 1 -> Real
        label = "Real" if prediction_score > 0.5 else "Fake"
        confidence = prediction_score if label == "Real" else (1.0 - prediction_score)

        # Grad-CAM
        heatmap = self._generate_gradcam(input_arr, face_rgb)

        # Source Attribution
        source_analysis = None
        try:
            source_analysis = self.source_analyzer.analyze(
                image_path, face_rgb, prediction_score
            )
            print(f"DEBUG: Source attribution -> {source_analysis['primary_source']} "
                  f"({source_analysis['primary_confidence']}%)")
        except Exception as e:
            print(f"Source analysis error: {e}")

        return {
            "prediction": label,
            "confidence": round(float(confidence) * 100, 2),
            "heatmap": heatmap,
            "source_analysis": source_analysis
        }

    def predict_video(self, video_path: str):
        if not self.model:
            return {"error": "Model not loaded"}

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"error": "Could not read video"}

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        step = max(1, frame_count // 15)
        
        preds = []
        last_face_rgb = None
        last_input_arr = None
        
        for i in range(15):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i * step)
            ret, frame = cap.read()
            if not ret: break
            
            face_bgr = self.face_extractor.extract_face(frame)
            if face_bgr is not None:
                face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
                input_arr = np.expand_dims(face_rgb, axis=0).astype("float32")
                p = self.model.predict(input_arr, verbose=0)[0][0]
                preds.append(p)
                last_face_rgb = face_rgb
                last_input_arr = input_arr
        
        cap.release()
        
        if not preds:
            return {"error": "No faces found in video"}

        avg_p = np.mean(preds)
        label = "Real" if avg_p > 0.5 else "Fake"
        confidence = avg_p if label == "Real" else (1.0 - avg_p)
        
        heatmap = None
        if last_face_rgb is not None:
            heatmap = self._generate_gradcam(last_input_arr, last_face_rgb)

        # Source Attribution
        source_analysis = None
        if last_face_rgb is not None:
            try:
                source_analysis = self.source_analyzer.analyze(
                    video_path, last_face_rgb, avg_p
                )
            except Exception as e:
                print(f"Source analysis error: {e}")

        return {
            "prediction": label,
            "confidence": round(float(confidence) * 100, 2),
            "heatmap": heatmap,
            "frames_analyzed": len(preds),
            "source_analysis": source_analysis
        }

if __name__ == "__main__":
    p = DeepfakePredictor()
    # test...

"""
Debug script to test model predictions and Grad-CAM on known samples.
"""
import cv2
import numpy as np
import tensorflow as tf
from utils.model_builder import DeepfakeModel

# Rebuild model exactly as in training
img_height, img_width = 224, 224

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
    tf.keras.layers.RandomZoom(0.1),
])

builder = DeepfakeModel(input_shape=(img_height, img_width, 3))
base_model = builder.build_transfer_model(fine_tune=False)

inputs = tf.keras.Input(shape=(img_height, img_width, 3))
x = data_augmentation(inputs)
x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
outputs = base_model(x)

model = tf.keras.Model(inputs, outputs)
model.load_weights("models/deepfake_model.h5")
print("Model loaded successfully!\n")

# Test on known REAL image (from training data)
real_img_path = "processed_dataset/real/129_10.png"
fake_img_path = "processed_dataset/fake/128_896_10.png"

print("=" * 50)
print("TEST 1: Using cv2.imread + cvtColor (our inference pipeline)")
print("=" * 50)

for label, path in [("REAL", real_img_path), ("FAKE", fake_img_path)]:
    img = cv2.imread(path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    inp = np.expand_dims(img_rgb, axis=0).astype("float32")
    pred = model.predict(inp, verbose=0)[0][0]
    predicted_label = "Real" if pred > 0.5 else "Fake"
    print(f"  {label} image -> Sigmoid output: {pred:.4f} -> Predicted: {predicted_label}")

print()
print("=" * 50)
print("TEST 2: Using TensorFlow's load_img (same as training)")
print("=" * 50)

for label, path in [("REAL", real_img_path), ("FAKE", fake_img_path)]:
    img = tf.keras.utils.load_img(path, target_size=(224, 224))
    img_arr = tf.keras.utils.img_to_array(img)  # This gives RGB float32 [0, 255]
    inp = np.expand_dims(img_arr, axis=0)
    pred = model.predict(inp, verbose=0)[0][0]
    predicted_label = "Real" if pred > 0.5 else "Fake"
    print(f"  {label} image -> Sigmoid output: {pred:.4f} -> Predicted: {predicted_label}")

print()
print("=" * 50)
print("TEST 3: Using cv2.imread RAW (no color conversion)")
print("=" * 50)

for label, path in [("REAL", real_img_path), ("FAKE", fake_img_path)]:
    img = cv2.imread(path)  # BGR
    inp = np.expand_dims(img, axis=0).astype("float32")
    pred = model.predict(inp, verbose=0)[0][0]
    predicted_label = "Real" if pred > 0.5 else "Fake"
    print(f"  {label} image -> Sigmoid output: {pred:.4f} -> Predicted: {predicted_label}")

print()
print("=" * 50)
print("TEST 4: Grad-CAM test on transfer model directly")
print("=" * 50)

# Find last conv layer in the transfer model
transfer_model = base_model
last_conv = None
for layer in transfer_model.layers:
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv = layer
    # Check nested MobileNetV2
    if hasattr(layer, 'layers'):
        for sub in layer.layers:
            if isinstance(sub, tf.keras.layers.Conv2D):
                last_conv = sub

if last_conv:
    print(f"  Last conv layer found: {last_conv.name}")
    
    # Test Grad-CAM on the transfer model
    try:
        grad_model = tf.keras.Model(
            inputs=transfer_model.input,
            outputs=[last_conv.output, transfer_model.output]
        )
        
        # Preprocess a test image manually
        img = tf.keras.utils.load_img(real_img_path, target_size=(224, 224))
        img_arr = tf.keras.utils.img_to_array(img)
        preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(img_arr)
        inp = np.expand_dims(preprocessed, axis=0)
        
        with tf.GradientTape() as tape:
            conv_out, pred_out = grad_model(inp, training=False)
            loss = pred_out[:, 0]
        
        grads = tape.gradient(loss, conv_out)
        print(f"  Gradients computed: {grads is not None}")
        if grads is not None:
            print(f"  Gradient shape: {grads.shape}")
            weights = tf.reduce_mean(grads, axis=(1, 2))
            cam = tf.reduce_sum(conv_out * weights[:, tf.newaxis, tf.newaxis, :], axis=-1)
            cam = tf.squeeze(cam).numpy()
            cam = np.maximum(cam, 0)
            if cam.max() > 0:
                cam = cam / cam.max()
            print(f"  CAM shape: {cam.shape}, min: {cam.min():.4f}, max: {cam.max():.4f}")
            print("  Grad-CAM SUCCESS!")
        else:
            print("  Grad-CAM FAILED: gradients are None")
    except Exception as e:
        print(f"  Grad-CAM FAILED: {e}")
else:
    print("  No conv layer found!")

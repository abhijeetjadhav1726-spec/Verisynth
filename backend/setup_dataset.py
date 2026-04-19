import os
import glob
import cv2

DOWNLOAD_DIR = r"D:\Downloads\archive (5)\1000_videos\train"
REAL_INPUT = os.path.join(DOWNLOAD_DIR, "real")
FAKE_INPUT = os.path.join(DOWNLOAD_DIR, "fake")

PROCESSED_REAL = "processed_dataset/real"
PROCESSED_FAKE = "processed_dataset/fake"

os.makedirs(PROCESSED_REAL, exist_ok=True)
os.makedirs(PROCESSED_FAKE, exist_ok=True)

def process_and_copy(input_dir, output_dir, target_size=(224, 224)):
    if not os.path.exists(input_dir):
        print(f"Directory not found: {input_dir}")
        return
        
    images = glob.glob(os.path.join(input_dir, "*.*"))
    print(f"Processing {len(images)} images from {input_dir}...")
    
    count = 0
    for img_path in images:
        img = cv2.imread(img_path)
        if img is not None:
            resized = cv2.resize(img, target_size)
            out_path = os.path.join(output_dir, os.path.basename(img_path))
            cv2.imwrite(out_path, resized)
            count += 1
            if count % 500 == 0:
                print(f"Processed {count}/{len(images)}...")
    print(f"Successfully prepared {count} images to {output_dir}\n")

if __name__ == "__main__":
    print("These dataset images are already cropped faces (128x128).")
    print("Resizing to 224x224 (for MobileNetV2) and preparing for training...\n")
    
    print("--- Preparing REAL dataset ---")
    process_and_copy(REAL_INPUT, PROCESSED_REAL)
    
    print("--- Preparing FAKE dataset ---")
    process_and_copy(FAKE_INPUT, PROCESSED_FAKE)
    
    print("Dataset setup complete! You can now run: python train.py")

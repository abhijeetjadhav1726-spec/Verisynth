import cv2
import os
import glob
from pathlib import Path

class VideoProcessor:
    def __init__(self, target_frames_per_video: int = 15):
        """
        Initializes the VideoProcessor.
        
        Args:
            target_frames_per_video (int): Maximum number of frames to extract from each video.
        """
        self.target_frames_per_video = target_frames_per_video

    def extract_frames(self, video_path: str, output_dir: str):
        """
        Extracts a fixed number of frames from a video and saves them to the output directory.
        
        Args:
            video_path (str): Path to the source video file.
            output_dir (str): Directory where extracted frames will be saved.
        """
        os.makedirs(output_dir, exist_ok=True)
        video_name = Path(video_path).stem
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Non-readable video {video_path}")
            return

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            return
            
        # Determine step size to uniformly sample frames
        step = max(1, total_frames // self.target_frames_per_video)
        
        frame_count = 0
        extracted_count = 0
        
        while extracted_count < self.target_frames_per_video:
            # Set video position
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
            ret, frame = cap.read()
            
            if not ret:
                break
                
            frame_filename = os.path.join(output_dir, f"{video_name}_frame_{extracted_count:04d}.jpg")
            cv2.imwrite(frame_filename, frame)
            
            extracted_count += 1
            frame_count += step
            
            # Boundary check
            if frame_count >= total_frames:
                break

        cap.release()
        print(f"Extracted {extracted_count} frames from {video_name}")

    def process_directory(self, input_dir: str, output_dir: str, category: str = "real"):
        """
        Process all videos in a directory.
        
        Args:
            input_dir (str): Directory containing videos (e.g., standard mp4 files).
            output_dir (str): Directory where extracted frames will be saved (e.g. dataset/real).
            category (str): 'real' or 'fake' to append to filenames/dirs if needed.
        """
        video_files = glob.glob(os.path.join(input_dir, "*.mp4")) + glob.glob(os.path.join(input_dir, "*.avi"))
        print(f"Found {len(video_files)} videos in {input_dir}")
        for video in video_files:
            self.extract_frames(video, output_dir)


if __name__ == "__main__":
    # Example usage
    processor = VideoProcessor(target_frames_per_video=30)
    # processor.process_directory("../test_videos/real", "../dataset/real")

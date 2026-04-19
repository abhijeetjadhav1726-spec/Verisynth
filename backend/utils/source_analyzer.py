"""
Source Attribution Analyzer for VeriSynth.

Predicts the likely AI generation source of a deepfake image using
forensic heuristic techniques (no separate ML training required):

1. EXIF / Metadata analysis   — AI tool fingerprints in image metadata
2. Frequency-domain analysis  — GAN spectral artifacts via FFT / DCT
3. Texture / noise residuals  — Blending seams, noise floor patterns
4. Color statistics            — Histogram shape, saturation anomalies
5. Face geometry               — Landmark symmetry, boundary smoothness

Each technique produces per-source scores which are fused with weighted
averaging into a ranked list of probable generation sources.
"""

import cv2
import numpy as np
import os
from typing import Dict, List, Optional, Any

# --------------------------------------------------------------------------- #
#  Try optional imports – degrade gracefully if unavailable                     #
# --------------------------------------------------------------------------- #
try:
    from PIL import Image as PILImage
    from PIL.ExifTags import TAGS
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    from scipy.fft import fft2, fftshift
    from scipy.ndimage import laplace
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False


# --------------------------------------------------------------------------- #
#  Known AI-generation sources and their categories                            #
# --------------------------------------------------------------------------- #
KNOWN_SOURCES = [
    {"name": "Stable Diffusion",  "category": "Diffusion Model"},
    {"name": "MidJourney",        "category": "Diffusion Model"},
    {"name": "DALL-E",            "category": "Diffusion Model"},
    {"name": "StyleGAN",          "category": "GAN"},
    {"name": "ProGAN",            "category": "GAN"},
    {"name": "FaceSwap",          "category": "Face Manipulation"},
    {"name": "DeepFaceLab",       "category": "Face Manipulation"},
    {"name": "Face2Face",         "category": "Face Reenactment"},
]

# Weights for each analysis technique in the final fusion
TECHNIQUE_WEIGHTS = {
    "metadata":       0.25,
    "frequency":      0.25,
    "texture":        0.20,
    "color":          0.15,
    "face_geometry":  0.15,
}


class SourceAnalyzer:
    """
    Forensic source-attribution analyser.

    Usage
    -----
    >>> analyzer = SourceAnalyzer()
    >>> result  = analyzer.analyze(image_path, face_rgb, prediction_score)
    """

    def __init__(self):
        # Pre-compile metadata keywords for each known tool
        self._metadata_keywords = {
            "Stable Diffusion": [
                "stable diffusion", "a1111", "automatic1111", "comfyui",
                "sd-webui", "stablediffusion", "sdxl", "stability.ai",
                "dreamstudio", "invoke", "diffusers",
            ],
            "MidJourney": [
                "midjourney", "mid journey", "mj", "discord.gg",
            ],
            "DALL-E": [
                "dall-e", "dalle", "openai", "chatgpt", "c2pa",
            ],
            "StyleGAN": [
                "stylegan", "nvidia", "thispersondoesnotexist",
            ],
        }

    # ------------------------------------------------------------------ #
    #  Public API                                                         #
    # ------------------------------------------------------------------ #
    def analyze(
        self,
        image_path: str,
        face_rgb: np.ndarray,
        prediction_score: float,
    ) -> Dict[str, Any]:
        """
        Run all forensic techniques and return a ranked source attribution.

        Parameters
        ----------
        image_path : str
            Path to the original uploaded image (for EXIF).
        face_rgb : np.ndarray
            Cropped face in RGB, shape (224, 224, 3), uint8.
        prediction_score : float
            Raw model output (0 = Fake, 1 = Real).

        Returns
        -------
        dict  with keys:
            probable_sources   – list[dict] top-3 ranked sources
            primary_source     – str  most likely source name
            primary_confidence – int  confidence 0-100
            analysis_details   – dict per-technique human-readable signals
        """
        # Per-source raw scores from each technique (source_name → float 0-1)
        metadata_scores,  metadata_signals  = self._analyze_metadata(image_path)
        frequency_scores, frequency_signals = self._analyze_frequency(face_rgb)
        texture_scores,   texture_signals   = self._analyze_texture(face_rgb)
        color_scores,     color_signals     = self._analyze_color_stats(face_rgb)
        geometry_scores,  geometry_signals  = self._analyze_face_geometry(face_rgb)

        # Weighted fusion
        fused = self._fuse_scores(
            metadata_scores, frequency_scores, texture_scores,
            color_scores, geometry_scores,
        )

        # Build ranked list (top 3)
        ranked = sorted(fused.items(), key=lambda x: x[1], reverse=True)[:3]

        # Normalise so the top-3 sum to 100 if possible
        total = sum(v for _, v in ranked) or 1.0
        probable_sources = []
        for name, raw in ranked:
            cat = next(
                (s["category"] for s in KNOWN_SOURCES if s["name"] == name),
                "Unknown",
            )
            conf = int(round(raw / total * 100))
            probable_sources.append({
                "name": name,
                "confidence": conf,
                "category": cat,
            })

        primary = probable_sources[0] if probable_sources else {
            "name": "Unknown", "confidence": 0, "category": "Unknown"
        }

        return {
            "probable_sources": probable_sources,
            "primary_source": primary["name"],
            "primary_confidence": primary["confidence"],
            "analysis_details": {
                "metadata_signals": metadata_signals,
                "frequency_signals": frequency_signals,
                "texture_signals": texture_signals,
                "color_signals": color_signals,
                "geometry_signals": geometry_signals,
            },
        }

    # ------------------------------------------------------------------ #
    #  1. EXIF / Metadata Analysis                                        #
    # ------------------------------------------------------------------ #
    def _analyze_metadata(self, image_path: str):
        """Scan EXIF and embedded metadata for AI-tool fingerprints."""
        scores: Dict[str, float] = {s["name"]: 0.0 for s in KNOWN_SOURCES}
        signals: List[str] = []

        if not HAS_PIL or not os.path.exists(image_path):
            signals.append("Metadata analysis unavailable (Pillow not installed or file missing)")
            return scores, signals

        try:
            img = PILImage.open(image_path)
        except Exception:
            signals.append("Could not read image metadata")
            return scores, signals

        # Collect all string-valued metadata
        meta_strings: List[str] = []

        # EXIF
        exif = img.getexif()
        if exif:
            for tag_id, val in exif.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                val_str = str(val).lower()
                meta_strings.append(val_str)
                if tag_name in ("Software", "ProcessingSoftware", "ImageDescription"):
                    signals.append(f"EXIF {tag_name}: {val}")

        # PNG tEXt / iTXt chunks (common for Stable Diffusion outputs)
        if hasattr(img, "info"):
            for k, v in img.info.items():
                meta_strings.append(str(k).lower())
                meta_strings.append(str(v).lower())
                if any(kw in str(k).lower() for kw in ["parameters", "prompt", "workflow"]):
                    signals.append(f"Embedded chunk '{k}' found (AI-generation indicator)")

        # Match keywords
        combined = " ".join(meta_strings)
        matched_any = False
        for source_name, keywords in self._metadata_keywords.items():
            for kw in keywords:
                if kw in combined:
                    scores[source_name] += 0.6
                    matched_any = True
                    signals.append(f"Keyword '{kw}' matched → {source_name}")

        if not matched_any:
            signals.append("No AI-specific metadata tags detected")
            # Give a slight edge to tools that typically strip metadata
            scores["StyleGAN"] += 0.1
            scores["ProGAN"] += 0.1
            scores["FaceSwap"] += 0.05
            scores["DeepFaceLab"] += 0.05

        return scores, signals

    # ------------------------------------------------------------------ #
    #  2. Frequency-Domain Analysis (FFT)                                 #
    # ------------------------------------------------------------------ #
    def _analyze_frequency(self, face_rgb: np.ndarray):
        """
        FFT-based spectral analysis.

        GANs (especially StyleGAN, ProGAN) produce characteristic spectral
        peaks at regular intervals due to transposed-convolution upsampling.
        Diffusion models produce smoother spectral envelopes.
        """
        scores: Dict[str, float] = {s["name"]: 0.0 for s in KNOWN_SOURCES}
        signals: List[str] = []

        gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)

        if HAS_SCIPY:
            f_transform = fftshift(fft2(gray))
        else:
            f_transform = np.fft.fftshift(np.fft.fft2(gray))

        magnitude = np.log1p(np.abs(f_transform))
        h, w = magnitude.shape

        # Analyse radial energy distribution
        cy, cx = h // 2, w // 2
        max_radius = min(cy, cx)

        radial_energy = []
        for r in range(1, max_radius):
            y_coords, x_coords = np.ogrid[-cy:h - cy, -cx:w - cx]
            mask = (x_coords ** 2 + y_coords ** 2 >= (r - 1) ** 2) & \
                   (x_coords ** 2 + y_coords ** 2 < r ** 2)
            ring_energy = magnitude[mask].mean() if mask.any() else 0
            radial_energy.append(ring_energy)

        radial_energy = np.array(radial_energy)

        # High-frequency energy ratio
        mid = len(radial_energy) // 2
        low_band = radial_energy[:mid].mean() if mid > 0 else 0
        high_band = radial_energy[mid:].mean() if mid > 0 else 0
        hf_ratio = high_band / (low_band + 1e-8)

        # Check for periodic peaks (GAN fingerprint)
        if len(radial_energy) > 10:
            diffs = np.diff(radial_energy)
            peak_count = np.sum((diffs[:-1] > 0) & (diffs[1:] < 0))
            peak_density = peak_count / len(radial_energy)
        else:
            peak_density = 0

        # Scoring logic
        if peak_density > 0.25:
            # Many spectral peaks → GAN signature (transposed convolution)
            scores["StyleGAN"] += 0.5
            scores["ProGAN"] += 0.4
            signals.append(f"High spectral peak density ({peak_density:.2f}) — consistent with GAN upsampling artifacts")
        elif peak_density > 0.15:
            scores["StyleGAN"] += 0.25
            scores["ProGAN"] += 0.2
            scores["FaceSwap"] += 0.15
            signals.append(f"Moderate spectral peaks ({peak_density:.2f}) — possible GAN or hybrid manipulation")
        else:
            signals.append(f"Smooth spectral envelope ({peak_density:.2f}) — consistent with diffusion models")
            scores["Stable Diffusion"] += 0.35
            scores["MidJourney"] += 0.3
            scores["DALL-E"] += 0.25

        if hf_ratio > 0.7:
            signals.append(f"Elevated high-frequency energy (ratio: {hf_ratio:.2f}) — may indicate upscaling or GAN artifacts")
            scores["StyleGAN"] += 0.1
            scores["ProGAN"] += 0.1
        elif hf_ratio < 0.3:
            signals.append(f"Low high-frequency energy (ratio: {hf_ratio:.2f}) — consistent with diffusion model smoothing")
            scores["Stable Diffusion"] += 0.15
            scores["MidJourney"] += 0.1
            scores["DALL-E"] += 0.1

        return scores, signals

    # ------------------------------------------------------------------ #
    #  3. Texture / Noise Residual Analysis                               #
    # ------------------------------------------------------------------ #
    def _analyze_texture(self, face_rgb: np.ndarray):
        """
        Analyse noise residuals and texture patterns.

        Face-swap tools leave blending seams; GANs produce uniform noise;
        diffusion models produce characteristic smooth gradients.
        """
        scores: Dict[str, float] = {s["name"]: 0.0 for s in KNOWN_SOURCES}
        signals: List[str] = []

        gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)

        # Laplacian variance (focus/sharpness measure)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        lap_var = laplacian.var()

        gray_float = gray.astype(np.float32)

        # Noise estimation via median filter residual
        median_filtered = cv2.medianBlur(gray, 5).astype(np.float32)
        noise_residual = gray_float - median_filtered
        noise_std = noise_residual.std()

        # Edge density
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size

        # Analyse face boundary vs center
        h, w = gray.shape
        margin = h // 6
        center = gray[margin:-margin, margin:-margin]
        border_top = gray[:margin, :]
        border_bot = gray[-margin:, :]
        border_left = gray[:, :margin]
        border_right = gray[:, -margin:]
        border_region = np.concatenate([
            border_top.flatten(), border_bot.flatten(),
            border_left.flatten(), border_right.flatten()
        ])

        center_noise = (center - cv2.medianBlur(
            center.astype(np.uint8), 5
        ).astype(np.float32)).std()
        border_noise = (border_region - np.median(border_region)).std()
        noise_diff = abs(center_noise - border_noise)

        # Scoring
        if noise_diff > 8:
            signals.append(f"Significant noise mismatch between face center and boundary (Δ={noise_diff:.1f}) — blending seam indicator")
            scores["FaceSwap"] += 0.45
            scores["DeepFaceLab"] += 0.4
            scores["Face2Face"] += 0.2
        elif noise_diff > 4:
            signals.append(f"Moderate noise difference at face boundary (Δ={noise_diff:.1f})")
            scores["FaceSwap"] += 0.2
            scores["DeepFaceLab"] += 0.2
            scores["Face2Face"] += 0.15
        else:
            signals.append(f"Uniform noise across face region (Δ={noise_diff:.1f}) — consistent with full-face generation")

        if lap_var < 100:
            signals.append(f"Low texture variance ({lap_var:.0f}) — over-smoothed, typical of diffusion models")
            scores["Stable Diffusion"] += 0.2
            scores["MidJourney"] += 0.2
            scores["DALL-E"] += 0.15
        elif lap_var > 800:
            signals.append(f"High texture variance ({lap_var:.0f}) — possible sharpening or GAN artifact")
            scores["StyleGAN"] += 0.15
            scores["ProGAN"] += 0.1

        if noise_std < 3:
            signals.append(f"Very low noise floor ({noise_std:.1f}) — AI-generated content tends to have clean noise profiles")
            scores["Stable Diffusion"] += 0.1
            scores["MidJourney"] += 0.1
        elif noise_std > 12:
            signals.append(f"Elevated noise ({noise_std:.1f}) — may indicate compression or face-swap blending")
            scores["FaceSwap"] += 0.1
            scores["DeepFaceLab"] += 0.1

        return scores, signals

    # ------------------------------------------------------------------ #
    #  4. Color Distribution Analysis                                     #
    # ------------------------------------------------------------------ #
    def _analyze_color_stats(self, face_rgb: np.ndarray):
        """
        Analyse color histogram shape and saturation patterns.

        Diffusion models often produce over-saturated or unnaturally smooth
        color gradients; GANs can produce quantisation artifacts.
        """
        scores: Dict[str, float] = {s["name"]: 0.0 for s in KNOWN_SOURCES}
        signals: List[str] = []

        hsv = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2HSV)
        h_channel, s_channel, v_channel = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

        # Saturation statistics
        sat_mean = s_channel.mean()
        sat_std = s_channel.std()

        # Value (brightness) histogram
        v_hist = cv2.calcHist([v_channel], [0], None, [256], [0, 256]).flatten()
        v_hist = v_hist / v_hist.sum()

        # Check for unusual histogram gaps (quantisation)
        zero_bins = np.sum(v_hist == 0)
        gap_ratio = zero_bins / 256

        # Color channel correlation
        r, g, b = face_rgb[:, :, 0].flatten().astype(float), \
                  face_rgb[:, :, 1].flatten().astype(float), \
                  face_rgb[:, :, 2].flatten().astype(float)

        rg_corr = np.corrcoef(r, g)[0, 1] if r.std() > 0 and g.std() > 0 else 0
        rb_corr = np.corrcoef(r, b)[0, 1] if r.std() > 0 and b.std() > 0 else 0

        # Scoring
        if sat_mean > 100:
            signals.append(f"High mean saturation ({sat_mean:.0f}) — common in MidJourney / DALL-E outputs")
            scores["MidJourney"] += 0.35
            scores["DALL-E"] += 0.2
            scores["Stable Diffusion"] += 0.15
        elif sat_mean < 40:
            signals.append(f"Low saturation ({sat_mean:.0f}) — muted tones, possible face-swap or GAN")
            scores["FaceSwap"] += 0.15
            scores["StyleGAN"] += 0.15
        else:
            signals.append(f"Normal saturation range ({sat_mean:.0f})")

        if gap_ratio > 0.3:
            signals.append(f"High histogram quantisation ({gap_ratio:.0%} empty bins) — possible GAN color artifacts")
            scores["StyleGAN"] += 0.2
            scores["ProGAN"] += 0.15
        elif gap_ratio < 0.05:
            signals.append(f"Smooth color distribution ({gap_ratio:.0%} gaps) — typical of diffusion models")
            scores["Stable Diffusion"] += 0.15
            scores["MidJourney"] += 0.1

        if rg_corr > 0.95 and rb_corr > 0.95:
            signals.append(f"Unusually high channel correlation (RG={rg_corr:.2f}, RB={rb_corr:.2f}) — synthetic uniformity indicator")
            scores["StyleGAN"] += 0.1
            scores["ProGAN"] += 0.1

        return scores, signals

    # ------------------------------------------------------------------ #
    #  5. Face Geometry Analysis                                          #
    # ------------------------------------------------------------------ #
    def _analyze_face_geometry(self, face_rgb: np.ndarray):
        """
        Analyse facial structure for geometric anomalies.

        Face-swap tools often produce asymmetric landmarks;
        GANs can generate perfectly symmetric but uncanny faces.
        """
        scores: Dict[str, float] = {s["name"]: 0.0 for s in KNOWN_SOURCES}
        signals: List[str] = []

        gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)
        h, w = gray.shape

        # Bilateral symmetry analysis
        left_half = gray[:, :w // 2]
        right_half = cv2.flip(gray[:, w // 2:], 1)

        # Ensure same dimensions
        min_w = min(left_half.shape[1], right_half.shape[1])
        left_half = left_half[:, :min_w].astype(np.float32)
        right_half = right_half[:, :min_w].astype(np.float32)

        symmetry_diff = np.mean(np.abs(left_half - right_half))
        symmetry_score = 1.0 - (symmetry_diff / 255.0)

        # Edge symmetry (structural features)
        left_edges = cv2.Canny(left_half.astype(np.uint8), 50, 150)
        right_edges = cv2.Canny(right_half.astype(np.uint8), 50, 150)
        edge_sym = 1.0 - (np.mean(np.abs(
            left_edges.astype(float) - right_edges.astype(float)
        )) / 255.0)

        # Smoothness of face boundary (outer ring)
        margin = max(1, h // 8)
        boundary = np.concatenate([
            gray[:margin, :].flatten(),
            gray[-margin:, :].flatten(),
            gray[:, :margin].flatten(),
            gray[:, -margin:].flatten(),
        ])
        boundary_smoothness = 1.0 / (1.0 + np.std(np.diff(boundary.astype(float))))

        # Scoring
        if symmetry_score > 0.92:
            signals.append(f"Unusually high facial symmetry ({symmetry_score:.2f}) — common in GAN-generated faces")
            scores["StyleGAN"] += 0.35
            scores["ProGAN"] += 0.3
        elif symmetry_score < 0.75:
            signals.append(f"Low facial symmetry ({symmetry_score:.2f}) — possible face-swap alignment issue")
            scores["FaceSwap"] += 0.25
            scores["DeepFaceLab"] += 0.2
            scores["Face2Face"] += 0.2
        else:
            signals.append(f"Normal facial symmetry ({symmetry_score:.2f})")

        if edge_sym > 0.9:
            signals.append(f"High structural edge symmetry ({edge_sym:.2f}) — synthetic generation indicator")
            scores["StyleGAN"] += 0.15
            scores["ProGAN"] += 0.1
        elif edge_sym < 0.7:
            signals.append(f"Asymmetric edge structure ({edge_sym:.2f}) — possible manipulation artifacts")
            scores["FaceSwap"] += 0.15
            scores["Face2Face"] += 0.15

        if boundary_smoothness > 0.15:
            signals.append(f"Smooth face boundary transition ({boundary_smoothness:.2f}) — well-blended or fully generated")
            scores["Stable Diffusion"] += 0.1
            scores["MidJourney"] += 0.1
        else:
            signals.append(f"Sharp face boundary ({boundary_smoothness:.2f}) — possible blending seam")
            scores["FaceSwap"] += 0.1
            scores["DeepFaceLab"] += 0.1

        return scores, signals

    # ------------------------------------------------------------------ #
    #  Score Fusion                                                       #
    # ------------------------------------------------------------------ #
    def _fuse_scores(
        self,
        metadata_scores: Dict[str, float],
        frequency_scores: Dict[str, float],
        texture_scores: Dict[str, float],
        color_scores: Dict[str, float],
        geometry_scores: Dict[str, float],
    ) -> Dict[str, float]:
        """Weighted average fusion of per-technique scores."""
        all_techniques = {
            "metadata":      metadata_scores,
            "frequency":     frequency_scores,
            "texture":       texture_scores,
            "color":         color_scores,
            "face_geometry": geometry_scores,
        }

        fused: Dict[str, float] = {s["name"]: 0.0 for s in KNOWN_SOURCES}

        for tech_name, tech_scores in all_techniques.items():
            weight = TECHNIQUE_WEIGHTS.get(tech_name, 0.1)
            for source_name, score in tech_scores.items():
                fused[source_name] += score * weight

        return fused


if __name__ == "__main__":
    # Quick smoke-test with a dummy image
    analyzer = SourceAnalyzer()
    dummy = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    result = analyzer.analyze("dummy_path.jpg", dummy, 0.2)
    print("Primary source:", result["primary_source"])
    print("Confidence:", result["primary_confidence"])
    for src in result["probable_sources"]:
        print(f"  {src['name']}: {src['confidence']}% ({src['category']})")

"""
Configuration for the CostCorrect backend.
Loads environment variables and defines constants.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Gemini API ──────────────────────────────────────────────────────────────
GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL: str = "gemini-2.0-flash"

# ── File Storage ────────────────────────────────────────────────────────────
UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "local")  # "local" | "gcs"

# ── GCS / POPIA-ready ──────────────────────────────────────────────────────
GCS_BUCKET: str = os.getenv("GCS_BUCKET", "")
GCS_REGION: str = os.getenv("GCS_REGION", "africa-south1")  # Johannesburg
# Alternative: "africa-south2" (Cape Town)

# ── SA Brick Constants ──────────────────────────────────────────────────────
BRICK_LENGTH_MM: float = 222
BRICK_HEIGHT_MM: float = 73
BRICK_WIDTH_MM: float = 106

BRICKS_PER_SQM_SINGLE: int = 52   # 110mm single-skin wall
BRICKS_PER_SQM_DOUBLE: int = 104  # 230mm double-skin wall

WASTAGE_FACTOR: float = 0.10  # 10 %

DEFAULT_WALL_HEIGHT_M: float = 2.7  # standard SA residential wall height

# ── Cement & Sand ───────────────────────────────────────────────────────────
# 1:4 mix  →  roughly 1 bag (50 kg) of cement per ~1.2 m² of single-skin wall
CEMENT_BAGS_PER_1000_BRICKS: float = 7.0   # ~7 bags per 1 000 bricks
SAND_CUBES_PER_1000_BRICKS: float = 0.5    # 0.5 m³ per 1 000 bricks

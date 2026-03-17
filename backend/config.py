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

# ── Auth ────────────────────────────────────────────────────────────────────
CLERK_WEBHOOK_SECRET: str = os.getenv("CLERK_WEBHOOK_SECRET", "")

# ── Supabase ────────────────────────────────────────────────────────────────
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

# ── Stripe ──────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRO_PRICE_ID: str = os.getenv("STRIPE_PRO_PRICE_ID", "")

# ── Paystack (SA-friendly alternative, feature-flagged) ────────────────────
ENABLE_PAYSTACK: bool = os.getenv("ENABLE_PAYSTACK", "false").lower() == "true"
PAYSTACK_SECRET_KEY: str = os.getenv("PAYSTACK_SECRET_KEY", "")

# ── SA Brick Constants ──────────────────────────────────────────────────────
BRICK_LENGTH_MM: float = 222
BRICK_HEIGHT_MM: float = 73
BRICK_WIDTH_MM: float = 106

# Stock brick (standard SA)
BRICKS_PER_SQM_SINGLE: int = 52   # 110mm single-skin wall
BRICKS_PER_SQM_DOUBLE: int = 104  # 230mm double-skin wall

# Maxi brick (SA) — 290 × 140 × 90 mm, fewer per m²
MAXI_BRICKS_PER_SQM_SINGLE: int = 37
MAXI_BRICKS_PER_SQM_DOUBLE: int = 74

WASTAGE_FACTOR: float = 0.10  # 10 %
DEFAULT_WALL_HEIGHT_M: float = 2.7  # standard SA residential wall height
DEFAULT_MORTAR_JOINT_MM: float = 10.0  # standard joint thickness

# ── Cement & Sand ───────────────────────────────────────────────────────────
# 1:4 mix  →  roughly 1 bag (50 kg) of cement per ~1.2 m² of single-skin wall
CEMENT_BAGS_PER_1000_BRICKS: float = 7.0   # ~7 bags per 1 000 bricks
SAND_CUBES_PER_1000_BRICKS: float = 0.5    # 0.5 m³ per 1 000 bricks

# ── Lintels ─────────────────────────────────────────────────────────────────
LINTEL_THRESHOLD_M: float = 0.6  # openings wider than 600mm need a lintel

# ── Placeholder Pricing (ZAR) ───────────────────────────────────────────────
PRICE_BRICK: float = 4.00           # stock brick
PRICE_MAXI_BRICK: float = 5.50      # maxi brick
PRICE_CEMENT_BAG: float = 120.00    # 50 kg bag
PRICE_SAND_CUBE: float = 400.00     # m³
PRICE_LINTEL_STANDARD: float = 120.00  # per lintel (900mm × 75mm)
VAT_RATE: float = 0.15              # South African VAT (15 %)

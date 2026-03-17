"""
Pydantic models for the CostCorrect API.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


class BrickType(str, Enum):
    STOCK = "stock"
    MAXI = "maxi"


class WallThickness(str, Enum):
    SINGLE = "single"   # 110mm
    DOUBLE = "double"   # 230mm


class WallMeasurement(BaseModel):
    """Raw measurements extracted by Gemini Vision."""
    scale: str = Field(..., description="Drawing scale detected, e.g. '1:100'")
    walls_230mm_linear_m: float = Field(..., description="Total linear meters of 230mm (double skin) walls")
    walls_110mm_linear_m: float = Field(..., description="Total linear meters of 110mm (single skin) walls")
    confidence_note: Optional[str] = Field(None, description="Any caveats Gemini reported")


class CalculatorAssumptions(BaseModel):
    """User-configurable assumptions for the BOQ calculation."""
    brick_type: BrickType = Field(BrickType.STOCK, description="Brick type (stock or maxi)")
    wall_height_m: float = Field(2.7, ge=1.5, le=6.0, description="Floor-to-ceiling height in meters")
    wastage_percent: float = Field(10.0, ge=0, le=30, description="Waste factor as a percentage (e.g. 10 for 10%)")
    mortar_joint_mm: float = Field(10.0, ge=6, le=15, description="Mortar joint thickness in mm")
    include_vat: bool = Field(False, description="Whether to add 15% VAT to cost estimates")
    floors: int = Field(1, ge=1, le=10, description="Number of floors")
    estimate_prices: bool = Field(False, description="Whether to include cost estimates")
    # Openings deduction
    openings_area_sqm: float = Field(0.0, ge=0, description="Total opening area to deduct (doors + windows) in m²")
    # Lintels
    openings_wider_than_600mm: int = Field(0, ge=0, description="Count of openings exceeding 600mm width (need lintels)")


class MaterialLine(BaseModel):
    """A single line item in the Bill of Quantities."""
    item: str
    quantity: float
    unit: str
    unit_price: Optional[float] = Field(None, description="Unit price in ZAR")
    estimated_cost: Optional[float] = Field(None, description="Estimated cost in Rand (R) if requested")
    note: Optional[str] = None


class BOQResponse(BaseModel):
    """Full Bill of Quantities response returned to the frontend."""
    filename: str
    scale: str

    # Assumptions snapshot (important for reproducibility & POPIA transparency)
    assumptions: CalculatorAssumptions

    # Wall geometry
    walls_230mm_linear_m: float
    walls_110mm_linear_m: float
    walls_230mm_area_sqm: float
    walls_110mm_area_sqm: float
    total_wall_area_sqm: float
    openings_deducted_sqm: float
    net_wall_area_sqm: float

    # Output quantities
    bricks_230mm: int
    bricks_110mm: int
    total_bricks: int
    cement_bags: float
    sand_cubes: float
    lintels: int

    wastage_percent: float

    # Materials table
    materials: list[MaterialLine]

    subtotal: Optional[float] = None
    vat_amount: Optional[float] = None
    total_estimated_cost: Optional[float] = None

    confidence_note: Optional[str] = None


class ProjectCreate(BaseModel):
    """Request to create a new project."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class Project(BaseModel):
    """Project record returned from API."""
    id: str
    user_id: str
    name: str
    description: Optional[str]
    created_at: str


class AuditLog(BaseModel):
    """Audit log entry for POPIA compliance."""
    user_id: str
    action: str
    resource: Optional[str]
    detail: Optional[str]
    timestamp: str


class UserDataExport(BaseModel):
    """POPIA data export for a user."""
    user_id: str
    email: Optional[str]
    projects: list[dict]
    estimates: list[dict]
    audit_logs: list[dict]

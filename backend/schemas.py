"""
Pydantic models for the CostCorrect API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class WallMeasurement(BaseModel):
    """Raw measurements extracted by Gemini Vision."""
    scale: str = Field(..., description="Drawing scale detected, e.g. '1:100'")
    walls_230mm_linear_m: float = Field(..., description="Total linear meters of 230mm (double skin) walls")
    walls_110mm_linear_m: float = Field(..., description="Total linear meters of 110mm (single skin) walls")
    confidence_note: Optional[str] = Field(None, description="Any caveats Gemini reported")


class MaterialLine(BaseModel):
    """A single line item in the Bill of Quantities."""
    item: str
    quantity: float
    unit: str


class BOQResponse(BaseModel):
    """Full Bill of Quantities response returned to the frontend."""
    filename: str
    scale: str
    wall_height_m: float

    walls_230mm_linear_m: float
    walls_110mm_linear_m: float
    walls_230mm_area_sqm: float
    walls_110mm_area_sqm: float

    bricks_230mm: int
    bricks_110mm: int
    total_bricks: int

    cement_bags: float
    sand_cubes: float

    wastage_percent: float

    materials: list[MaterialLine]

    confidence_note: Optional[str] = None

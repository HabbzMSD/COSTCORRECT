"""
South African brick/mortar calculation engine for CostCorrect.

Standard brick: 222 × 106 × 73 mm
Single skin (110 mm): ~52 bricks/m²
Double skin (230 mm): ~104 bricks/m²
Wastage: +10 %
Cement 1:4 mix: ~7 bags per 1 000 bricks
Sand: ~0.5 m³ per 1 000 bricks
"""

import math
from schemas import BOQResponse, MaterialLine
from config import (
    BRICKS_PER_SQM_SINGLE,
    BRICKS_PER_SQM_DOUBLE,
    WASTAGE_FACTOR,
    DEFAULT_WALL_HEIGHT_M,
    CEMENT_BAGS_PER_1000_BRICKS,
    SAND_CUBES_PER_1000_BRICKS,
    PRICE_BRICK,
    PRICE_CEMENT_BAG,
    PRICE_SAND_CUBE,
)


def calculate_boq(
    filename: str,
    scale: str,
    walls_230mm_linear_m: float,
    walls_110mm_linear_m: float,
    wall_height_m: float = DEFAULT_WALL_HEIGHT_M,
    floors: int = 1,
    estimate_prices: bool = False,
    confidence_note: str | None = None,
) -> BOQResponse:
    """
    Compute the full Bill of Quantities from wall measurements.

    Parameters
    ----------
    walls_230mm_linear_m : total linear meters of 230mm double-skin walls
    walls_110mm_linear_m : total linear meters of 110mm single-skin walls
    wall_height_m        : floor-to-ceiling height (default 2.7 m)
    """

    # ── Wall areas ──────────────────────────────────────────────────────────
    area_230 = walls_230mm_linear_m * wall_height_m * floors
    area_110 = walls_110mm_linear_m * wall_height_m * floors

    # ── Brick counts (before wastage) ───────────────────────────────────────
    bricks_230_raw = area_230 * BRICKS_PER_SQM_DOUBLE
    bricks_110_raw = area_110 * BRICKS_PER_SQM_SINGLE

    # ── Apply 10 % wastage ──────────────────────────────────────────────────
    bricks_230 = math.ceil(bricks_230_raw * (1 + WASTAGE_FACTOR))
    bricks_110 = math.ceil(bricks_110_raw * (1 + WASTAGE_FACTOR))
    total_bricks = bricks_230 + bricks_110

    # ── Cement bags ─────────────────────────────────────────────────────────
    cement_bags_raw = (total_bricks / 1000) * CEMENT_BAGS_PER_1000_BRICKS
    cement_bags = round(cement_bags_raw * (1 + WASTAGE_FACTOR), 1)

    # ── Sand cubes ──────────────────────────────────────────────────────────
    sand_cubes_raw = (total_bricks / 1000) * SAND_CUBES_PER_1000_BRICKS
    sand_cubes = round(sand_cubes_raw * (1 + WASTAGE_FACTOR), 2)

    # ── Assemble materials table ────────────────────────────────────────────
    materials: list[MaterialLine] = [
        MaterialLine(item="Bricks — 230 mm double skin", quantity=bricks_230, unit="bricks", estimated_cost=bricks_230 * PRICE_BRICK if estimate_prices else None),
        MaterialLine(item="Bricks — 110 mm single skin", quantity=bricks_110, unit="bricks", estimated_cost=bricks_110 * PRICE_BRICK if estimate_prices else None),
        MaterialLine(item="Cement (50 kg bags)", quantity=cement_bags, unit="bags", estimated_cost=cement_bags * PRICE_CEMENT_BAG if estimate_prices else None),
        MaterialLine(item="Building sand", quantity=sand_cubes, unit="m³", estimated_cost=sand_cubes * PRICE_SAND_CUBE if estimate_prices else None),
    ]

    total_cost = None
    if estimate_prices:
        total_cost = sum(m.estimated_cost for m in materials if m.estimated_cost is not None)

    return BOQResponse(
        filename=filename,
        scale=scale,
        wall_height_m=wall_height_m,
        walls_230mm_linear_m=round(walls_230mm_linear_m, 2),
        walls_110mm_linear_m=round(walls_110mm_linear_m, 2),
        walls_230mm_area_sqm=round(area_230, 2),
        walls_110mm_area_sqm=round(area_110, 2),
        bricks_230mm=bricks_230,
        bricks_110mm=bricks_110,
        total_bricks=total_bricks,
        cement_bags=cement_bags,
        sand_cubes=sand_cubes,
        wastage_percent=WASTAGE_FACTOR * 100,
        materials=materials,
        total_estimated_cost=total_cost,
        confidence_note=confidence_note,
    )

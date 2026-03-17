"""
South African brick/mortar/lintel calculation engine for CostCorrect.

Supported brick types:
  - Stock brick (222 × 106 × 73 mm): 52 bricks/m² single, 104 double
  - Maxi brick  (290 × 140 × 90 mm): 37 bricks/m² single, 74 double

Joint thickness: 10 mm default (configurable)
Wastage: 10 % default (configurable 0–30 %)
Cement 1:4 mix: ~7 bags per 1 000 bricks (50 kg bags)
Sand: ~0.5 m³ per 1 000 bricks
Lintels: required for openings > 600 mm wide
"""

import math
from schemas import BOQResponse, MaterialLine, CalculatorAssumptions, BrickType
from config import (
    BRICKS_PER_SQM_SINGLE,
    BRICKS_PER_SQM_DOUBLE,
    MAXI_BRICKS_PER_SQM_SINGLE,
    MAXI_BRICKS_PER_SQM_DOUBLE,
    DEFAULT_WALL_HEIGHT_M,
    CEMENT_BAGS_PER_1000_BRICKS,
    SAND_CUBES_PER_1000_BRICKS,
    PRICE_BRICK,
    PRICE_MAXI_BRICK,
    PRICE_CEMENT_BAG,
    PRICE_SAND_CUBE,
    PRICE_LINTEL_STANDARD,
    VAT_RATE,
)


def calculate_boq(
    filename: str,
    scale: str,
    walls_230mm_linear_m: float,
    walls_110mm_linear_m: float,
    assumptions: CalculatorAssumptions | None = None,
    confidence_note: str | None = None,
) -> BOQResponse:
    """
    Compute the full Bill of Quantities from wall measurements and user assumptions.

    All inputs should be real-world metres.
    Assumptions are fully snapshotted into the response so the estimate is
    reproducible and auditable.
    """
    if assumptions is None:
        assumptions = CalculatorAssumptions()

    wastage = assumptions.wastage_percent / 100.0
    wall_height = assumptions.wall_height_m
    floors = assumptions.floors
    brick_type = assumptions.brick_type
    estimate_prices = assumptions.estimate_prices

    # ── Brick lookup ────────────────────────────────────────────────────────
    if brick_type == BrickType.MAXI:
        bricks_per_sqm_single = MAXI_BRICKS_PER_SQM_SINGLE
        bricks_per_sqm_double = MAXI_BRICKS_PER_SQM_DOUBLE
        price_per_brick = PRICE_MAXI_BRICK
        brick_label = "Maxi brick"
    else:
        bricks_per_sqm_single = BRICKS_PER_SQM_SINGLE
        bricks_per_sqm_double = BRICKS_PER_SQM_DOUBLE
        price_per_brick = PRICE_BRICK
        brick_label = "Stock brick"

    # ── Wall areas (gross) ──────────────────────────────────────────────────
    area_230_gross = walls_230mm_linear_m * wall_height * floors
    area_110_gross = walls_110mm_linear_m * wall_height * floors
    total_wall_area = area_230_gross + area_110_gross

    # ── Openings deduction ──────────────────────────────────────────────────
    openings_deducted = min(assumptions.openings_area_sqm, total_wall_area)
    # Distribute opening deduction proportionally between wall types
    if total_wall_area > 0:
        ratio_230 = area_230_gross / total_wall_area
    else:
        ratio_230 = 0.5
    area_230_net = max(0, area_230_gross - openings_deducted * ratio_230)
    area_110_net = max(0, area_110_gross - openings_deducted * (1 - ratio_230))
    net_wall_area = area_230_net + area_110_net

    # ── Brick counts (before wastage) ───────────────────────────────────────
    bricks_230_raw = area_230_net * bricks_per_sqm_double
    bricks_110_raw = area_110_net * bricks_per_sqm_single

    # ── Apply wastage ───────────────────────────────────────────────────────
    bricks_230 = math.ceil(bricks_230_raw * (1 + wastage))
    bricks_110 = math.ceil(bricks_110_raw * (1 + wastage))
    total_bricks = bricks_230 + bricks_110

    # ── Cement bags ─────────────────────────────────────────────────────────
    cement_bags_raw = (total_bricks / 1000) * CEMENT_BAGS_PER_1000_BRICKS
    cement_bags = round(cement_bags_raw * (1 + wastage), 1)

    # ── Sand cubes ──────────────────────────────────────────────────────────
    sand_cubes_raw = (total_bricks / 1000) * SAND_CUBES_PER_1000_BRICKS
    sand_cubes = round(sand_cubes_raw * (1 + wastage), 2)

    # ── Lintels (basic rule: openings > 600mm need a lintel) ────────────────
    lintels = assumptions.openings_wider_than_600mm

    # ── Assemble materials table ────────────────────────────────────────────
    materials: list[MaterialLine] = [
        MaterialLine(
            item=f"{brick_label} — 230 mm double skin",
            quantity=bricks_230,
            unit="bricks",
            unit_price=price_per_brick if estimate_prices else None,
            estimated_cost=round(bricks_230 * price_per_brick, 2) if estimate_prices else None,
        ),
        MaterialLine(
            item=f"{brick_label} — 110 mm single skin",
            quantity=bricks_110,
            unit="bricks",
            unit_price=price_per_brick if estimate_prices else None,
            estimated_cost=round(bricks_110 * price_per_brick, 2) if estimate_prices else None,
        ),
        MaterialLine(
            item="Cement (50 kg bags, 1:4 mix)",
            quantity=cement_bags,
            unit="bags",
            unit_price=PRICE_CEMENT_BAG if estimate_prices else None,
            estimated_cost=round(cement_bags * PRICE_CEMENT_BAG, 2) if estimate_prices else None,
        ),
        MaterialLine(
            item="Building sand",
            quantity=sand_cubes,
            unit="m³",
            unit_price=PRICE_SAND_CUBE if estimate_prices else None,
            estimated_cost=round(sand_cubes * PRICE_SAND_CUBE, 2) if estimate_prices else None,
        ),
    ]

    if lintels > 0:
        materials.append(
            MaterialLine(
                item="Lintels (900 mm × 75 mm standard)",
                quantity=lintels,
                unit="units",
                unit_price=PRICE_LINTEL_STANDARD if estimate_prices else None,
                estimated_cost=round(lintels * PRICE_LINTEL_STANDARD, 2) if estimate_prices else None,
                note="User-confirmed opening count. Verify lintel lengths on site.",
            )
        )

    # ── Cost totals ─────────────────────────────────────────────────────────
    subtotal = None
    vat_amount = None
    total_cost = None

    if estimate_prices:
        subtotal = round(sum(m.estimated_cost for m in materials if m.estimated_cost is not None), 2)
        if assumptions.include_vat:
            vat_amount = round(subtotal * VAT_RATE, 2)
            total_cost = round(subtotal + vat_amount, 2)
        else:
            total_cost = subtotal

    return BOQResponse(
        filename=filename,
        scale=scale,
        assumptions=assumptions,
        walls_230mm_linear_m=round(walls_230mm_linear_m, 2),
        walls_110mm_linear_m=round(walls_110mm_linear_m, 2),
        walls_230mm_area_sqm=round(area_230_gross, 2),
        walls_110mm_area_sqm=round(area_110_gross, 2),
        total_wall_area_sqm=round(total_wall_area, 2),
        openings_deducted_sqm=round(openings_deducted, 2),
        net_wall_area_sqm=round(net_wall_area, 2),
        bricks_230mm=bricks_230,
        bricks_110mm=bricks_110,
        total_bricks=total_bricks,
        cement_bags=cement_bags,
        sand_cubes=sand_cubes,
        lintels=lintels,
        wastage_percent=assumptions.wastage_percent,
        materials=materials,
        subtotal=subtotal,
        vat_amount=vat_amount,
        total_estimated_cost=total_cost,
        confidence_note=confidence_note,
    )

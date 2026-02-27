"""
Unit tests for the SA brick calculation engine.
"""

import math
import pytest
from calculator import calculate_boq
from config import (
    BRICKS_PER_SQM_SINGLE,
    BRICKS_PER_SQM_DOUBLE,
    WASTAGE_FACTOR,
    CEMENT_BAGS_PER_1000_BRICKS,
    SAND_CUBES_PER_1000_BRICKS,
)


def test_basic_double_skin_only():
    """10 linear m of 230mm wall at 2.7 m height."""
    boq = calculate_boq(
        filename="test.pdf",
        scale="1:100",
        walls_230mm_linear_m=10.0,
        walls_110mm_linear_m=0.0,
        wall_height_m=2.7,
    )

    area = 10.0 * 2.7  # 27 m²
    raw_bricks = area * BRICKS_PER_SQM_DOUBLE  # 2808
    expected_bricks = math.ceil(raw_bricks * (1 + WASTAGE_FACTOR))  # 3089

    assert boq.bricks_230mm == expected_bricks
    assert boq.bricks_110mm == 0
    assert boq.total_bricks == expected_bricks
    assert boq.walls_230mm_area_sqm == 27.0
    assert boq.walls_110mm_area_sqm == 0.0
    assert boq.wastage_percent == 10.0


def test_basic_single_skin_only():
    """15 linear m of 110mm wall at 2.7 m height."""
    boq = calculate_boq(
        filename="test.pdf",
        scale="1:50",
        walls_230mm_linear_m=0.0,
        walls_110mm_linear_m=15.0,
        wall_height_m=2.7,
    )

    area = 15.0 * 2.7  # 40.5 m²
    raw_bricks = area * BRICKS_PER_SQM_SINGLE  # 2106
    expected_bricks = math.ceil(raw_bricks * (1 + WASTAGE_FACTOR))  # 2317

    assert boq.bricks_110mm == expected_bricks
    assert boq.bricks_230mm == 0
    assert boq.total_bricks == expected_bricks


def test_mixed_walls():
    """Both wall types together."""
    boq = calculate_boq(
        filename="mixed.pdf",
        scale="1:100",
        walls_230mm_linear_m=20.0,
        walls_110mm_linear_m=10.0,
        wall_height_m=2.7,
    )

    area_230 = 20.0 * 2.7
    area_110 = 10.0 * 2.7
    b230 = math.ceil(area_230 * BRICKS_PER_SQM_DOUBLE * (1 + WASTAGE_FACTOR))
    b110 = math.ceil(area_110 * BRICKS_PER_SQM_SINGLE * (1 + WASTAGE_FACTOR))

    assert boq.bricks_230mm == b230
    assert boq.bricks_110mm == b110
    assert boq.total_bricks == b230 + b110


def test_cement_and_sand():
    """Verify cement and sand calculations include wastage."""
    boq = calculate_boq(
        filename="test.pdf",
        scale="1:100",
        walls_230mm_linear_m=10.0,
        walls_110mm_linear_m=5.0,
        wall_height_m=2.7,
    )

    total = boq.total_bricks
    cement_raw = (total / 1000) * CEMENT_BAGS_PER_1000_BRICKS
    cement_expected = round(cement_raw * (1 + WASTAGE_FACTOR), 1)

    sand_raw = (total / 1000) * SAND_CUBES_PER_1000_BRICKS
    sand_expected = round(sand_raw * (1 + WASTAGE_FACTOR), 2)

    assert boq.cement_bags == cement_expected
    assert boq.sand_cubes == sand_expected


def test_materials_table_has_four_lines():
    """The materials list should have exactly 4 line items."""
    boq = calculate_boq(
        filename="test.pdf",
        scale="1:100",
        walls_230mm_linear_m=5.0,
        walls_110mm_linear_m=5.0,
    )
    assert len(boq.materials) == 4
    items = [m.item for m in boq.materials]
    assert "Bricks — 230 mm double skin" in items
    assert "Bricks — 110 mm single skin" in items
    assert "Cement (50 kg bags)" in items
    assert "Building sand" in items


def test_zero_walls():
    """Edge case: no walls at all."""
    boq = calculate_boq(
        filename="empty.pdf",
        scale="1:100",
        walls_230mm_linear_m=0.0,
        walls_110mm_linear_m=0.0,
    )
    assert boq.total_bricks == 0
    assert boq.cement_bags == 0.0
    assert boq.sand_cubes == 0.0

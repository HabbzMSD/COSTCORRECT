import json
import re
import fitz  # PyMuPDF
from pathlib import Path
from PIL import Image
from google import genai
from google.genai import types

from config import GOOGLE_API_KEY, GEMINI_MODEL
from schemas import WallMeasurement


# ── Helpers ─────────────────────────────────────────────────────────────────

def pdf_to_images(pdf_path: str, dpi: int = 200) -> list[str]:
    """Convert every page of a PDF to a PNG image, return list of paths."""
    doc = fitz.open(pdf_path)
    image_paths: list[str] = []
    for i, page in enumerate(doc):
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        out_path = str(Path(pdf_path).with_suffix("")) + f"_page{i}.png"
        pix.save(out_path)
        image_paths.append(out_path)
    doc.close()
    return image_paths


def _extract_json(text: str) -> dict:
    """Robustly extract a JSON object from Gemini's response text."""
    # Strip markdown code fences
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback: find the first { ... } block via regex
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Last resort: try to fix common issues (trailing commas)
    cleaned = re.sub(r",\s*}", "}", text)
    cleaned = re.sub(r",\s*]", "]", cleaned)
    return json.loads(cleaned)


VISION_PROMPT = """You are an expert quantity surveyor analysing a South African architectural floor plan.

Examine this drawing carefully and extract the following information.  Return ONLY valid JSON — no markdown fences, no commentary.

{
  "scale": "<the drawing scale, e.g. '1:100'. If not visible, estimate from dimensions>",
  "walls_230mm_linear_m": <total linear meters of 230 mm (double-skin / cavity) walls>,
  "walls_110mm_linear_m": <total linear meters of 110 mm (single-skin) walls>,
  "confidence_note": "<any caveats or assumptions you made>"
}

Rules:
1. External / structural walls are typically 230 mm (double skin).
2. Internal partition walls are typically 110 mm (single skin).
3. Use the scale bar or stated scale to convert drawn lengths to real-world meters.
4. If a scale bar is present, use it. Otherwise, use any stated dimensions to infer the scale.
5. Sum ALL wall segments of each type across the entire drawing.
6. Return the JSON object only — no extra text.
"""


async def analyse_plan(image_path: str) -> WallMeasurement:
    """
    Send an architectural plan image to Gemini Vision and return
    structured wall measurements.
    """
    client = genai.Client(api_key=GOOGLE_API_KEY)

    # If the file is a PDF, convert pages to images and use the first page
    path = Path(image_path)
    if path.suffix.lower() == ".pdf":
        pages = pdf_to_images(image_path)
        image_path = pages[0]  # analyse first page (floor plan)

    # Load the image
    img = Image.open(image_path)

    # Use the simpler list-based content format (confirmed working)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[VISION_PROMPT, img],
        config=types.GenerateContentConfig(
            temperature=0.1,
            max_output_tokens=2048,
            response_mime_type="application/json",
        ),
    )

    # Parse the JSON response (robust extraction)
    data = _extract_json(response.text)

    return WallMeasurement(
        scale=data.get("scale", "unknown"),
        walls_230mm_linear_m=float(data.get("walls_230mm_linear_m", 0)),
        walls_110mm_linear_m=float(data.get("walls_110mm_linear_m", 0)),
        confidence_note=data.get("confidence_note"),
    )


"""
CostCorrect FastAPI application.
Upload an architectural plan → Gemini Vision → SA BOQ.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from storage import get_storage
from vision import analyse_plan
from calculator import calculate_boq
from schemas import BOQResponse

app = FastAPI(
    title="CostCorrect API",
    description="Upload an architectural plan and receive a South African Bill of Quantities.",
    version="0.1.0",
)

# ── CORS — allow the Next.js frontend ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/upload", response_model=BOQResponse)
async def upload_plan(file: UploadFile = File(...)):
    """
    Accept an architectural plan (PDF/PNG/JPG), analyse it with
    Gemini Vision, and return a Bill of Quantities.
    """
    # ── Validate file type ──────────────────────────────────────────────────
    filename = file.filename or "upload"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # ── Save file ───────────────────────────────────────────────────────────
    storage = get_storage()
    saved_path = await storage.save(file)

    # ── Gemini Vision analysis ──────────────────────────────────────────────
    try:
        measurement = await analyse_plan(saved_path)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini Vision analysis failed: {exc}",
        )

    # ── Calculate BOQ ───────────────────────────────────────────────────────
    boq = calculate_boq(
        filename=filename,
        scale=measurement.scale,
        walls_230mm_linear_m=measurement.walls_230mm_linear_m,
        walls_110mm_linear_m=measurement.walls_110mm_linear_m,
        confidence_note=measurement.confidence_note,
    )

    return boq


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

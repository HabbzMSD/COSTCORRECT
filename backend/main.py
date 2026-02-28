"""
CostCorrect FastAPI application.
Upload an architectural plan → Gemini Vision → SA BOQ.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from storage import get_storage
from vision import analyse_plan
from calculator import calculate_boq
from schemas import BOQResponse
from auth import get_current_user_tier

app = FastAPI(
    title="CostCorrect API",
    description="Upload an architectural plan and receive a South African Bill of Quantities.",
    version="0.1.0",
)

# ── CORS — allow the Next.js frontend ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://costcorrect.vercel.app"
    ],
    allow_origin_regex=r"https://costcorrect.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/me")
async def get_me(tier: str = Depends(get_current_user_tier)):
    return {"tier": tier}


@app.post("/api/upload", response_model=BOQResponse)
async def upload_plan(
    file: UploadFile = File(...),
    floors: int = Form(1),
    estimate_prices: bool = Form(False),
    tier: str = Depends(get_current_user_tier),
):
    """
    Accept an architectural plan (PDF/PNG/JPG), analyse it with
    Gemini Vision, and return a Bill of Quantities.
    """
    if (floors > 1 or estimate_prices) and tier == "free":
        raise HTTPException(
            status_code=402,
            detail="Payment Required: Multi-floor analysis and cost estimation are Pro features. Please upgrade your account."
        )

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
        floors=floors,
        estimate_prices=estimate_prices,
        confidence_note=measurement.confidence_note,
    )

    return boq


@app.post("/api/webhooks/clerk")
async def clerk_webhook(
    request: Request,
    svix_id: str = Header(default=None),
    svix_timestamp: str = Header(default=None),
    svix_signature: str = Header(default=None),
):
    import os
    from svix.webhooks import Webhook, WebhookVerificationError
    from supabase import create_client, Client

    # 1. Get webhook secret from environment
    webhook_secret = os.environ.get("CLERK_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Missing CLERK_WEBHOOK_SECRET")

    # 2. Get the raw body
    payload = await request.body()
    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    }

    # 3. Verify the webhook signature
    try:
        wh = Webhook(webhook_secret)
        evt = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 4. Handle the event
    event_type = evt.get("type")
    
    if event_type == "user.created":
        data = evt.get("data", {})
        user_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        primary_email = email_addresses[0].get("email_address") if email_addresses else None
        
        if user_id and primary_email:
            # Insert into Supabase
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                print("Warning: Missing Supabase credentials. Cannot save user.")
            else:
                supabase: Client = create_client(supabase_url, supabase_key)
                try:
                    supabase.table("profiles").insert({
                        "id": user_id,
                        "email": primary_email,
                        "tier": "free"
                    }).execute()
                    print(f"Successfully synced user {primary_email} to Supabase")
                except Exception as e:
                    print(f"Failed to insert user to Supabase: {e}")

    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

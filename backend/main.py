"""
CostCorrect FastAPI application.
Upload an architectural plan → Gemini Vision → SA BOQ.
"""

import io
import os
import json
import csv
import datetime
import stripe

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from storage import get_storage
from vision import analyse_plan
from calculator import calculate_boq
from schemas import BOQResponse, CalculatorAssumptions, BrickType, UserDataExport
from auth import get_current_user_tier, verify_token, get_supabase
from config import (
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_PRICE_ID,
    ENABLE_PAYSTACK,
    PAYSTACK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET,
)

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(
    title="CostCorrect API",
    description="Upload an architectural plan and receive a South African Bill of Quantities.",
    version="0.2.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://costcorrect.vercel.app",
    ],
    allow_origin_regex=r"https://costcorrect.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _write_audit(user_id: str, action: str, resource: str = None, detail: str = None):
    """Fire-and-forget audit log to Supabase."""
    try:
        supabase = get_supabase()
        supabase.table("audit_logs").insert({
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "detail": detail,
            "created_at": datetime.datetime.utcnow().isoformat(),
        }).execute()
    except Exception as e:
        print(f"Audit log failed (non-fatal): {e}")


def _boq_to_csv_bytes(boq: BOQResponse) -> bytes:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["CostCorrect - Bill of Quantities"])
    writer.writerow(["File", boq.filename, "Scale", boq.scale])
    writer.writerow(["Brick Type", boq.assumptions.brick_type.value,
                     "Wall Height (m)", boq.assumptions.wall_height_m,
                     "Waste %", boq.assumptions.wastage_percent])
    writer.writerow([])
    writer.writerow(["Item", "Quantity", "Unit", "Unit Price (ZAR)", "Estimated Cost (ZAR)", "Note"])
    for mat in boq.materials:
        writer.writerow([
            mat.item,
            mat.quantity,
            mat.unit,
            mat.unit_price or "",
            mat.estimated_cost or "",
            mat.note or "",
        ])
    writer.writerow([])
    if boq.subtotal is not None:
        writer.writerow(["Subtotal (excl. VAT)", "", "", "", boq.subtotal])
    if boq.vat_amount is not None:
        writer.writerow(["VAT (15%)", "", "", "", boq.vat_amount])
    if boq.total_estimated_cost is not None:
        writer.writerow(["TOTAL", "", "", "", boq.total_estimated_cost])
    writer.writerow([])
    writer.writerow(["AI Confidence Note", boq.confidence_note or "N/A"])
    writer.writerow(["Generated", datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")])
    writer.writerow(["Disclaimer", "AI-assisted suggested takeoff. Verify all quantities on site before procurement."])
    return output.getvalue().encode("utf-8")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}


# ── Auth info ─────────────────────────────────────────────────────────────────

@app.get("/api/me")
async def get_me(tier: str = Depends(get_current_user_tier)):
    return {"tier": tier}


# ── Main upload + analyse endpoint ────────────────────────────────────────────

@app.post("/api/upload", response_model=BOQResponse)
async def upload_plan(
    file: UploadFile = File(...),
    # Assumption fields (passed from frontend form)
    brick_type: str = Form("stock"),
    wall_height_m: float = Form(2.7),
    wastage_percent: float = Form(10.0),
    mortar_joint_mm: float = Form(10.0),
    floors: int = Form(1),
    estimate_prices: bool = Form(False),
    include_vat: bool = Form(False),
    openings_area_sqm: float = Form(0.0),
    openings_wider_than_600mm: int = Form(0),
    tier: str = Depends(get_current_user_tier),
):
    """
    Accept an architectural plan (PDF/PNG/JPG), analyse it with
    Gemini Vision, and return a Bill of Quantities.
    """
    if (floors > 1 or estimate_prices) and tier == "free":
        raise HTTPException(
            status_code=402,
            detail="Multi-floor analysis and cost estimates are Pro features. Please upgrade.",
        )

    filename = file.filename or "upload"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    storage = get_storage()
    saved_path = await storage.save(file)

    try:
        measurement = await analyse_plan(saved_path)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini Vision analysis failed: {exc}")

    assumptions = CalculatorAssumptions(
        brick_type=BrickType(brick_type),
        wall_height_m=wall_height_m,
        wastage_percent=wastage_percent,
        mortar_joint_mm=mortar_joint_mm,
        floors=floors,
        estimate_prices=estimate_prices,
        include_vat=include_vat,
        openings_area_sqm=openings_area_sqm,
        openings_wider_than_600mm=openings_wider_than_600mm,
    )

    boq = calculate_boq(
        filename=filename,
        scale=measurement.scale,
        walls_230mm_linear_m=measurement.walls_230mm_linear_m,
        walls_110mm_linear_m=measurement.walls_110mm_linear_m,
        assumptions=assumptions,
        confidence_note=measurement.confidence_note,
    )

    return boq


# ── Export endpoints ──────────────────────────────────────────────────────────

@app.post("/api/export/csv")
async def export_csv(boq: BOQResponse):
    """Generate a CSV export of a BOQ result."""
    csv_bytes = _boq_to_csv_bytes(boq)
    filename = f"costcorrect_boq_{datetime.date.today()}.csv"
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/api/export/json")
async def export_json(boq: BOQResponse):
    """Return BOQ as downloadable JSON (useful for integration)."""
    content = boq.model_dump_json(indent=2)
    filename = f"costcorrect_boq_{datetime.date.today()}.json"
    return StreamingResponse(
        io.BytesIO(content.encode()),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── Stripe Billing ────────────────────────────────────────────────────────────

@app.post("/api/billing/create-checkout")
async def create_checkout(
    request: Request,
    tier: str = Depends(get_current_user_tier),
):
    """Create a Stripe Checkout session to upgrade to Pro."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Billing not configured.")

    body = await request.json()
    success_url = body.get("success_url", "http://localhost:3000/dashboard?upgraded=true")
    cancel_url = body.get("cancel_url", "http://localhost:3000/pricing")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": STRIPE_PRO_PRICE_ID, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"source": "costcorrect"},
    )
    return {"url": session.url}


@app.post("/api/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(default=None),
):
    """Handle Stripe webhook events (subscription updates)."""
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")

    if event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        status = sub.get("status")
        customer_email = sub.get("customer_email")
        new_tier = "pro" if status == "active" else "free"
        if customer_email:
            try:
                supabase = get_supabase()
                supabase.table("profiles").update({"tier": new_tier}).eq("email", customer_email).execute()
            except Exception as e:
                print(f"Failed to update tier in Supabase: {e}")

    return {"received": True}


# ── Clerk Webhook ─────────────────────────────────────────────────────────────

@app.post("/api/webhooks/clerk")
async def clerk_webhook(
    request: Request,
    svix_id: str = Header(default=None),
    svix_timestamp: str = Header(default=None),
    svix_signature: str = Header(default=None),
):
    from svix.webhooks import Webhook, WebhookVerificationError

    webhook_secret = CLERK_WEBHOOK_SECRET
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Missing CLERK_WEBHOOK_SECRET")

    payload = await request.body()
    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    }
    try:
        wh = Webhook(webhook_secret)
        evt = wh.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = evt.get("type")
    if event_type == "user.created":
        data = evt.get("data", {})
        user_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        primary_email = email_addresses[0].get("email_address") if email_addresses else None
        if user_id and primary_email:
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_KEY")
            if supabase_url and supabase_key:
                try:
                    supabase = get_supabase()
                    supabase.table("profiles").insert({
                        "id": user_id,
                        "email": primary_email,
                        "tier": "free",
                    }).execute()
                    await _write_audit(user_id, "user.created", "profiles", primary_email)
                except Exception as e:
                    print(f"Failed to insert user: {e}")

    return {"success": True}


# ── Admin Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/admin/users")
async def admin_list_users(tier: str = Depends(get_current_user_tier)):
    if tier != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    supabase = get_supabase()
    result = supabase.table("profiles").select("id, email, tier, created_at").execute()
    return result.data


@app.patch("/api/admin/users/{user_id}/tier")
async def admin_update_tier(user_id: str, body: dict, tier: str = Depends(get_current_user_tier)):
    if tier != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    new_tier = body.get("tier")
    if new_tier not in ("free", "pro", "admin"):
        raise HTTPException(status_code=400, detail="Invalid tier")
    supabase = get_supabase()
    supabase.table("profiles").update({"tier": new_tier}).eq("id", user_id).execute()
    return {"updated": True}


@app.get("/api/admin/audit-logs")
async def admin_audit_logs(tier: str = Depends(get_current_user_tier), limit: int = 100):
    if tier != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    supabase = get_supabase()
    result = supabase.table("audit_logs").select("*").order("created_at", desc=True).limit(limit).execute()
    return result.data


# ── POPIA (Data Subject Rights) ────────────────────────────────────────────────

@app.get("/api/popia/export")
async def popia_export(tier: str = Depends(get_current_user_tier), request: Request = None):
    """
    POPIA Section 23: Data subject right to access their data.
    Returns all data held for the authenticated user.
    """
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from auth import verify_token
    from fastapi import Security

    # Get user_id from token
    auth_header = request.headers.get("authorization", "")
    token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    import jwt as pyjwt
    unverified = pyjwt.decode(token, options={"verify_signature": False})
    user_id = unverified.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = get_supabase()
    profile = supabase.table("profiles").select("*").eq("id", user_id).execute()
    estimates = supabase.table("estimates").select("*").eq("user_id", user_id).execute()
    logs = supabase.table("audit_logs").select("*").eq("user_id", user_id).execute()

    export = {
        "user_id": user_id,
        "profile": profile.data,
        "estimates": estimates.data if estimates.data else [],
        "audit_logs": logs.data if logs.data else [],
        "exported_at": datetime.datetime.utcnow().isoformat(),
        "note": "This export is provided under POPIA Section 23 (Right of Access).",
    }

    await _write_audit(user_id, "popia.export", "all_data")
    return JSONResponse(content=export)


@app.delete("/api/popia/delete-my-data")
async def popia_delete(request: Request):
    """
    POPIA Section 24: Data subject right to deletion.
    Deletes all personal data for the authenticated user (audit log retained for 1 year).
    """
    auth_header = request.headers.get("authorization", "")
    token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    import jwt as pyjwt
    unverified = pyjwt.decode(token, options={"verify_signature": False})
    user_id = unverified.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = get_supabase()
    supabase.table("estimates").delete().eq("user_id", user_id).execute()
    supabase.table("profiles").delete().eq("id", user_id).execute()
    await _write_audit(user_id, "popia.delete", "all_data", "User requested data deletion under POPIA")

    return {"deleted": True, "message": "Your personal data has been deleted. Audit logs are retained for 1 year as required by compliance."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

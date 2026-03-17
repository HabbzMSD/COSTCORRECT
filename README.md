# CostCorrect

**AI-assisted architectural plan takeoff for the South African market.**

Upload a PDF plan → Gemini Vision analyses it → get a full Bill of Quantities (bricks, cement, sand, lintels) in seconds.

---

## Features

| Feature | Free | Pro |
|---|---|---|
| PDF / PNG / JPG upload | ✅ | ✅ |
| Gemini AI wall detection | ✅ | ✅ |
| Stock + Maxi brick types | Stock only | ✅ |
| Configurable waste %, wall height | ✅ | ✅ |
| Openings deduction + lintels | ✅ | ✅ |
| Multi-floor (up to 10) | ❌ | ✅ |
| Cost estimates (ZAR) + VAT toggle | ❌ | ✅ |
| PDF report + CSV/Excel export | Watermarked | Clean |
| Admin dashboard + audit logs | ❌ | ✅ (admins) |
| POPIA data export / deletion | ✅ | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Clerk auth |
| Backend | FastAPI (Python 3.10+), Pydantic v2 |
| AI | Gemini 2.0 Flash via Google GenAI SDK |
| Storage | Local (dev) / GCS africa-south1 (prod) |
| Auth | Clerk (JWT) + Supabase (user profiles/tiers) |
| Billing | Stripe (Cards) + Paystack (feature-flagged, SA) |
| POPIA | Data export/delete endpoints, audit log table |

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A Clerk account (free)
- A Supabase project (free tier)
- A Google API key with Gemini enabled

### 1. Backend

```bash
cd backend
cp .env.example .env          # Fill in your values
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000.
OpenAPI docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # Fill in your Clerk keys
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

### 3. Supabase Setup

Run the following SQL in your Supabase project (SQL editor):

```sql
-- User profiles (synced via Clerk webhook)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimates history (optional, for dashboard)
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  filename TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POPIA-compliant audit log
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Key Routes

| Route | Description |
|---|---|
| `/` | Dashboard (overview, recent estimates) |
| `/estimator` | Plan upload + AI analysis + BOQ |
| `/pricing` | Pricing page (Starter / Pro / Enterprise) |
| `/admin` | Admin dashboard (users + audit logs) |
| `/privacy` | POPIA data settings (export / delete) |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/me` | Get current user's tier |
| `POST` | `/api/upload` | Upload plan → get BOQ |
| `POST` | `/api/export/csv` | Export BOQ as CSV |
| `POST` | `/api/export/json` | Export BOQ as JSON |
| `POST` | `/api/billing/create-checkout` | Create Stripe checkout |
| `POST` | `/api/webhooks/stripe` | Stripe billing webhook |
| `POST` | `/api/webhooks/clerk` | Clerk user sync webhook |
| `GET` | `/api/admin/users` | [Admin] List users |
| `PATCH` | `/api/admin/users/{id}/tier` | [Admin] Update user tier |
| `GET` | `/api/admin/audit-logs` | [Admin] Audit log |
| `GET` | `/api/popia/export` | [User] Export all my data |
| `DELETE` | `/api/popia/delete-my-data` | [User] Delete my data |

---

## SA Calculation Defaults

| Parameter | Default | Configurable |
|---|---|---|
| Brick type | Stock (222×106×73mm) | Stock / Maxi |
| Wall height | 2.7 m | 2.1 – 4.5 m |
| Joint thickness | 10 mm | UI setting |
| Waste factor | 10% | 5 – 20% |
| Bricks/m² (single skin) | 52 (Stock), 37 (Maxi) | N/A |
| Bricks/m² (double skin) | 104 (Stock), 74 (Maxi) | N/A |
| Cement bags / 1000 bricks | 7 bags (50 kg, 1:4 mix) | N/A |
| Sand / 1000 bricks | 0.5 m³ | N/A |
| Lintel threshold | 600 mm opening width | N/A |
| VAT | 15% (toggle) | On/Off |

---

## POPIA Compliance

- **Data minimization**: only email + uploaded plans stored.
- **Scoped storage**: plans stored in GCS `africa-south1` (Johannesburg).
- **Retention**: free plan uploads deleted after 30 days; Pro after subscription ends.
- **Right to access** (Section 23): `/api/popia/export` — returns JSON of all user data.
- **Right to deletion** (Section 24): `/api/popia/delete-my-data` — deletes profile + estimates; audit log retained 12 months.
- **Audit trail**: All POPIA actions logged to `audit_logs` table.

---

## Deployment (Google Cloud Run)

```bash
# Build and push backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/costcorrect-api ./backend

# Deploy backend
gcloud run deploy costcorrect-api \
  --image gcr.io/YOUR_PROJECT/costcorrect-api \
  --region africa-south1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=...,SUPABASE_URL=...,SUPABASE_KEY=...,STRIPE_SECRET_KEY=...

# Deploy frontend to Vercel (recommended for Next.js)
vercel --prod
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

> **Disclaimer**: CostCorrect provides AI-assisted suggested takeoffs only. All quantities must be verified by a qualified quantity surveyor before procurement. CostCorrect (Pty) Ltd accepts no liability for calculation errors.

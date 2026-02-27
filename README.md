# COSTCORRECT (BOQ SaaS)

COSTCORRECT is an AI-powered SaaS web application designed for the South African construction market. It allows users to upload architectural plan drawings (PDF or images) and leverages AI (Gemini Vision) to automatically detect wall lengths to generate an instant Bill of Quantities (BOQ).

## 🚀 Features

- **AI-Powered Scale Detection & Extraction:** Upload standard architectural floor plans and have AI read the scale and calculate linear meters for walls.
- **South African Building Standards:** Built to calculate based on double-skin (230mm) and single-skin (110mm) wall lengths using standard SA brick dimensions.
- **Automated BOQ Generation:** Outputs a table with Total Bricks, Bags of Cement, and Cubes of Sand—along with a standard 10% wastage buffer.
- **Privacy & Compliance First:** Designed with POPIA compliance in mind.

## 🛠️ Architecture

The application is built using a modern, decoupled stack:

- **Backend:** Python + FastAPI
  - Powered by the `google-genai` SDK for Gemini Vision extraction.
  - Image/PDF processing with `PyMuPDF` (fitz) and `Pillow`.
  - Type-safe schemas with `Pydantic`.
- **Frontend:** Next.js + React + TypeScript
  - Clean, component-driven UI using Next.js 14 App Router.

## ⚙️ Local Setup Instructions

Prerequisites:
- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.10+](https://www.python.org/) (for the backend)
- A Google Gemini API Key.

### 1. Setting up the Backend (FastAPI)

```powershell
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment (Windows)
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run the development server
uvicorn main:app --reload
```
The backend API will be running at `http://127.0.0.1:8000`.

### 2. Setting up the Frontend (Next.js)

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```
The frontend will be running at `http://localhost:3000`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Live Deployment on Vercel

If deploying the Frontend via [Vercel](https://vercel.com/):
1. Import your GitHub repository to Vercel.
2. In the Vercel dashboard, make sure the **Framework Preset** is set to `Next.js`.
3. Set the **Root Directory** to `frontend`.
4. Ensure the backend URL is either deployed elsewhere (e.g. Render, Railway, AWS) or proxied correctly if sharing the same root.
5. Deploy and enjoy the smooth `framer-motion` integrated experiences!

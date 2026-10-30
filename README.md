# RoamAI — Personalized AI Travel Itinerary Planner
### Production-Grade Full-Stack SaaS Application (React + FastAPI + Supabase + Generative AI)

RoamAI is a modern travel intelligence platform that creates hyper-personalized, geographically clustered day-by-day itineraries based on destination, travel dates, target budgets, group styles, interests, and dietary/accessibility requirements.

---

## 🌟 Key Features

1. **AI-Powered Itinerary Generation Engine**
   - High-fidelity Gemini API integration (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) with structured JSON schema responses.
   - Pydantic response validation and graceful algorithmic fallback if API quota or key is not provided.
   - Geographically clustered activities preventing cross-city backtracking.
   - Strict budget breakdown across lodging, food, transit, and attraction tickets.
   - **Bring-Your-Own Gemini API Key**: Users can enter their Google Gemini API key directly in their Settings/Profile screen without needing to edit `.env` files.

2. **Full Itinerary Customization (CRUD)**
   - Inline activity editor (adjust title, time slot, duration, cost, location, transit tips).
   - Add new activities to any morning, afternoon, or evening slot.
   - Delete unwanted activities with auto-recalculated totals.
   - **Regenerate Single Day**: Revise only a specific day with custom notes without losing the rest of your trip.
   - **Regenerate Entire Trip**: Re-synthesize all days with global feedback.
   - **Interactive Day Navigation**: Filter by individual day tabs or view all days simultaneously.
   - **Instant Google Maps Integration**: 1-click links on every attraction, restaurant, and hotel to preview real locations on Google Maps.
   - **1-Click Share**: Copy shareable itinerary link to clipboard with animated confirmation.

3. **Supabase Cloud Database & Auth**
   - Supabase PostgreSQL with Row Level Security (RLS) policies (`schema.sql`).
   - Email/password authentication and secure JWT validation.
   - Users can only view, edit, or delete their own trips and itineraries.
   - Zero-setup local SQLite fallback mode enabled automatically until cloud credentials are added.

4. **Professional PDF Travel Guide Export**
   - Instant client and server-side PDF export with printable layouts, daily schedules, tips, dining, and transit summaries.

5. **SaaS Dashboard & Management**
   - Live travel stats (trips planned, road days, budgets tracked).
   - Duplicate trips with 1 click.
   - Search and filter by destination or budget tier.
   - Customizable profile and default travel preferences.

---

## 🏗️ Project Architecture

```
travel-planner/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry & CORS
│   │   ├── config.py                   # Environment & settings
│   │   ├── database.py                 # Supabase client + local fallback DB
│   │   ├── schemas/
│   │   │   ├── user.py                 # User & Auth schemas
│   │   │   ├── trip.py                 # Trip request/response models
│   │   │   └── itinerary.py            # DayPlan, ActivityItem, BudgetBreakdown schemas
│   │   ├── routes/
│   │   │   ├── auth.py                 # Register, login, profile endpoints
│   │   │   ├── trips.py                # Trips CRUD & duplication
│   │   │   └── itinerary.py            # AI generation, regeneration, & PDF
│   │   ├── services/
│   │   │   ├── ai_service.py           # Gemini API caller & smart fallback generator
│   │   │   └── itinerary_service.py    # Business logic & day updates
│   │   └── utils/
│   │       ├── prompt_templates.py     # Prompt engineering with strict JSON output
│   │       └── pdf_service.py          # ReportLab PDF generation
│   ├── schema.sql                      # Supabase PostgreSQL tables & RLS policies
│   ├── requirements.txt                # Python dependencies
│   ├── Dockerfile                      # Production container image
│   ├── .env.example                    # Sample backend environment
│   └── .env                            # Active backend configuration
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js               # Axios instance with auth & Gemini key interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation with cloud status indicator
│   │   │   ├── Footer.jsx              # Footer with tech details
│   │   │   ├── ProtectedRoute.jsx      # Auth route guard
│   │   │   ├── LoadingSpinner.jsx      # Animated travel loader
│   │   │   └── EditActivityModal.jsx   # Inline activity CRUD modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Supabase & backend auth provider
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Hero, curated destinations, testimonials
│   │   │   ├── AuthPage.jsx            # Sign in, Sign up, 1-click Demo Traveler
│   │   │   ├── Dashboard.jsx           # Stats cards, upcoming trips, quick actions
│   │   │   ├── TripBuilder.jsx         # 5-step interactive wizard
│   │   │   ├── ItineraryView.jsx       # Day-wise interactive itinerary & PDF export
│   │   │   ├── MyTripsPage.jsx         # Filterable trip library
│   │   │   └── ProfilePage.jsx         # User settings & Gemini API key configuration
│   │   ├── services/
│   │   │   └── supabase.js             # Supabase client initializer
│   │   ├── App.jsx                     # Route definitions
│   │   ├── main.jsx                    # React entrypoint
│   │   └── index.css                   # Tailwind styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                     # Vercel SPA rewrites
│   └── .env.example
├── render.yaml                         # Blueprint for Render deployment
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v25)
- **Python**: 3.10+ (tested on Python 3.12)

### 2. Backend Setup
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   # Activate virtualenv (on Windows: venv\Scripts\activate, on Unix: source venv/bin/activate)
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Configure `.env`:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_from_ai_studio
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=super-secret-key-min-32-chars
   PORT=8000
   ```
3. Run the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive Swagger docs are live at: `http://localhost:8000/docs`.

### 3. Frontend Setup
1. Open a terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Configure `.env`:
   ```ini
   VITE_API_URL=http://localhost:8000/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser to: `http://localhost:3000` (or `http://localhost:5173`).

---

## 🗄️ Supabase PostgreSQL Setup & RLS

To run in the cloud with Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `backend/schema.sql` and click **Run**.
4. Copy your project URL and public Anon key into `backend/.env` and `frontend/.env`.

---

## 🚢 Deployment Instructions

### Frontend (Vercel)
1. Push your repository to GitHub.
2. In Vercel, import the repo and set the Root Directory to `frontend`.
3. The `frontend/vercel.json` file ensures all single-page application routes are correctly rewritten to `/index.html`.
4. Add environment variables:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
   - `VITE_SUPABASE_URL=https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your-key`
5. Deploy!

### Backend (Render / Docker)
1. Using the included `render.yaml`, Render can deploy both the backend API and frontend static site automatically as a Blueprint.
2. Alternatively, create a Web Service pointing to `backend/`:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Environment variables: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`.
4. The included `backend/Dockerfile` is ready for instant containerized deployment on Render, Fly.io, Cloud Run, or Railway.

---

## 🧪 Testing

Run the full end-to-end backend verification test suite:
```bash
cd backend
python test_api.py
```
This tests user creation, trip creation, AI itinerary generation, single day regeneration, complete itinerary regeneration with custom feedback, PDF export, trip update, and trip deletion.

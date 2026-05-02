# EMRS - Explainable Mess Reviewing System

A production-ready MERN stack application with dual moderation engines for fair and transparent mess (canteen) reviews.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   React +    │────▶│  Node.js +   │────▶│  Python FastAPI   │
│   Vite +     │     │  Express     │     │  ML Microservice  │
│  TailwindCSS │◀────│  MongoDB     │◀────│  SHAP + RF Model  │
└──────────────┘     └──────────────┘     └──────────────────┘
   Port 5173           Port 5000             Port 8000
```

## Features

- **JWT Authentication** with RBAC (Student, Admin, SysAdmin)
- **Review Submission** with multi-dimensional ratings
- **Metrics-Based Fairness Engine** - Rule-based credibility scoring
- **AI Moderation Engine** - Random Forest classifier with SHAP explainability
- **Comparison Engine** - Agreement/disagreement detection between engines
- **Interactive Dashboards** - Charts, analytics, and explanation viewers
- **Color-coded Status** - Green (Valid), Yellow (Suspicious), Red (Spam)

## Project Structure

```
MessReviewSystem/
├── backend/                  # Node.js + Express API
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic engines
│   ├── server.js             # Entry point
│   └── seed.js               # Database seeder
├── frontend/                 # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks (useAuth)
│   │   └── services/         # API service layer
│   └── index.html
└── ml-service/               # Python FastAPI microservice
    ├── app.py                # FastAPI server
    ├── train_model.py        # Model training script
    ├── explain.py            # SHAP explainability engine
    ├── model.pkl             # Trained model (generated)
    └── requirements.txt      # Python dependencies
```

## Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.9
- **MongoDB** running locally on port 27017 (or MongoDB Atlas)
- **npm** or **yarn**

## Setup Instructions

### 1. Clone and Install Backend

```bash
cd backend
npm install
```

### 2. Configure Environment

The `.env` file is pre-configured for local development:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/emrs
JWT_SECRET=emrs_super_secret_key_2026
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
```

### 3. Install Frontend

```bash
cd frontend
npm install
```

### 4. Setup Python ML Service

```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
```

This will:
- Generate a synthetic training dataset (2000 samples)
- Train a Random Forest classifier
- Save the model as `model.pkl`

### 5. Seed the Database

```bash
cd backend
npm run seed
```

This creates demo users and sample reviews.

### 6. Start All Services

**Terminal 1 - ML Service:**
```bash
cd ml-service
python app.py
# or: uvicorn app:app --reload --port 8000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Open the App

Visit: **http://localhost:5173**

## Demo Accounts

| Role     | Email                      | Password    |
|----------|----------------------------|-------------|
| Student  | alice@university.edu       | password123 |
| Student  | bob@university.edu         | password123 |
| Student  | charlie@university.edu     | password123 |
| Student  | diana@university.edu       | password123 |
| Student  | eve@university.edu         | password123 |
| Admin    | admin@university.edu       | admin123    |
| SysAdmin | sysadmin@university.edu    | sysadmin123 |

## API Endpoints

### Auth
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Register new user  |
| POST   | /api/auth/login      | Login              |
| GET    | /api/auth/me         | Get current user   |

### Reviews
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/reviews        | Submit review        |
| GET    | /api/reviews        | List reviews         |
| GET    | /api/reviews/:id    | Get review details   |

### Moderation
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/metrics/analyze  | Run metrics engine       |
| GET    | /api/metrics/:id      | Get metrics result       |
| POST   | /api/ai/analyze       | Run AI engine            |
| GET    | /api/ai/:id           | Get AI result            |

### Reports
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| GET    | /api/reports/fairness   | Fairness reports       |
| GET    | /api/reports/admin      | Admin analytics        |

## Moderation Engines

### Metrics-Based Fairness Engine
Calculates a 0-100 credibility score using rules:
- Review frequency from same user (24h window)
- Negative review spike detection (30min window)
- Rating variance from hostel average
- IP address duplication check
- Review timing anomaly detection

### AI-Based Classifier Engine
- **Model:** Random Forest (100 estimators)
- **Features:** rating, food_quality, cleanliness, service, rating_variance, review_frequency, ip_similarity, hostel_avg_rating, rating_spike
- **Output:** valid / suspicious / spam with confidence score
- **Explainability:** SHAP TreeExplainer generates feature impact values

### Comparison Engine
Compares outputs of both systems and generates:
- Agreement score (0-100%)
- Disagreement flag
- Combined natural language explanation

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React, Vite, TailwindCSS, Recharts  |
| Backend   | Node.js, Express, MongoDB, JWT      |
| ML Service| Python, FastAPI, Scikit-learn, SHAP  |
| Database  | MongoDB with Mongoose ODM           |

## License

Academic use only. Built for evaluation purposes.

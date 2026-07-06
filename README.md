# Business Success Predictor AI 🚀

A premium, modern, and production-ready startup geomarketing success simulator. It helps entrepreneurs, owners, and investors predict whether opening a business at any selected coordinate will succeed, leveraging advanced machine learning models (RandomForest and XGBoost) and geospatial data metrics.

---

## 🛠️ Technology Stack
- **Frontend**: React, Next.js (App Router), TypeScript, Tailwind CSS (v4), Framer Motion, Recharts, Leaflet (interactive maps), jsPDF (vector reports).
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth.
- **ML Inference Service**: Python, FastAPI, Scikit-Learn, XGBoost, Pandas, NumPy.

---

## 📂 Project Structure
```text
business-success-predictor-ai/
├── backend/            # Express REST API (Auth, Reports, Chatbot, Admin)
│   ├── models/         # Mongoose Schemas (User, Prediction, Chat, Log)
│   ├── routes/         # Express Router endpoints
│   ├── middleware/     # JWT Auth controllers
│   └── server.js       # Entry point & DB connector
├── ml_service/         # Python ML prediction engine
│   ├── models/         # Saved joblib regressor weights
│   ├── app.py          # FastAPI endpoint controllers
│   ├── train.py        # RandomForest & XGBoost training script
│   └── requirements.txt# Python dependency list
├── frontend/           # Next.js App Router SPA
│   ├── src/
│   │   ├── app/        # Pages, Auth screens, Dashboard tabs
│   │   ├── components/ # Navbar, Footer, Leaflet Maps selectors
│   │   └── lib/        # API client modules
│   └── package.json    # Next.js dependency list
└── package.json        # Root workspace concurrent manager script
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port `27017` or configured via `.env`)
- Python (v3.9+)

### Quick Setup

1. **Install Root & Sub-service Dependencies**:
   From the project root directory, run:
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside `backend/` (a template is pre-created for you):
   ```text
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/business_success_predictor
   JWT_SECRET=supersecretjwtkeyforbusinesspredictor
   ML_SERVICE_URL=http://127.0.0.1:8000
   ```

3. **Install Python Packages & Train ML Models**:
   Open a terminal in `ml_service/` and run:
   ```bash
   pip install -r requirements.txt
   python train.py
   ```
   This will train the RandomForest & XGBoost regressors on a synthetic commercial dataset and save the models to `models/`.

4. **Launch the Whole Stack**:
   From the project root directory, run:
   ```bash
   npm run dev
   ```
   This runs all three services concurrently:
   - **Frontend**: `http://localhost:3000`
   - **Express Backend**: `http://localhost:5000`
   - **Python ML Service**: `http://localhost:8000`

---

## 🔑 Administrative Access
The system automatically seeds a default admin account on server start:
- **Email**: `admin@predictor.ai`
- **Password**: `Admin123!`

---

## 📜 Sub-documentation
Detailed diagrams and specifications are available in the root:
- Check out the **[API Documentation](file:///C:/Users/mukes/.gemini/antigravity/scratch/business-success-predictor-ai/API_DOCUMENTATION.md)**
- Check out the **[Database Schema Documentation](file:///C:/Users/mukes/.gemini/antigravity/scratch/business-success-predictor-ai/DATABASE_SCHEMA.md)**
- Check out the **[Architecture Specifications](file:///C:/Users/mukes/.gemini/antigravity/scratch/business-success-predictor-ai/ARCHITECTURE.md)**

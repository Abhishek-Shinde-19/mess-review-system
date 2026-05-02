"""
EMRS - AI Moderation Microservice
FastAPI application for review classification and explainability.
"""

import os
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from explain import ExplainabilityEngine

app = FastAPI(
    title="EMRS AI Moderation Service",
    description="ML-based review classification with SHAP explainability",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model_data = None
explainer = None

LABEL_NAMES = ["valid", "suspicious", "spam"]


class ReviewFeatures(BaseModel):
    rating: float
    food_quality: float
    cleanliness: float
    service: float
    rating_variance: float = 0.0
    review_frequency: int = 0
    ip_similarity: int = 0
    hostel_avg_rating: float = 3.0
    rating_spike: int = 0


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    top_features: List[dict]
    explanation: str
    shap_values: List[dict]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


@app.on_event("startup")
async def load_model():
    global model_data, explainer
    if os.path.exists(MODEL_PATH):
        model_data = joblib.load(MODEL_PATH)
        explainer = ExplainabilityEngine(
            model_data["model"],
            model_data["feature_cols"]
        )
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print(f"WARNING: Model file not found at {MODEL_PATH}. Run train_model.py first.")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=model_data is not None
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(features: ReviewFeatures):
    if model_data is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train_model.py first.")

    model = model_data["model"]
    feature_cols = model_data["feature_cols"]

    # Build feature array in correct order
    feature_values = np.array([[
        features.rating,
        features.food_quality,
        features.cleanliness,
        features.service,
        features.rating_variance,
        features.review_frequency,
        features.ip_similarity,
        features.hostel_avg_rating,
        features.rating_spike
    ]])

    # Get prediction and probability
    prediction_idx = model.predict(feature_values)[0]
    probabilities = model.predict_proba(feature_values)[0]
    confidence = float(probabilities[prediction_idx])
    prediction_label = LABEL_NAMES[prediction_idx]

    # Get SHAP explanation
    shap_result = explainer.explain(feature_values)

    # Format top features
    top_features = [
        {"feature": f["feature"], "impact": f["impact"]}
        for f in shap_result["important_features"][:5]
    ]

    return PredictionResponse(
        prediction=prediction_label,
        confidence=round(confidence, 4),
        top_features=top_features,
        explanation=shap_result["explanation"],
        shap_values=shap_result["all_features"]
    )


@app.post("/explain")
async def explain_prediction(features: ReviewFeatures):
    """Get detailed SHAP explanation for a review."""
    if model_data is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    feature_values = np.array([[
        features.rating,
        features.food_quality,
        features.cleanliness,
        features.service,
        features.rating_variance,
        features.review_frequency,
        features.ip_similarity,
        features.hostel_avg_rating,
        features.rating_spike
    ]])

    shap_result = explainer.explain(feature_values)
    return shap_result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

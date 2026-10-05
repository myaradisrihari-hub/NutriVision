from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(
    title="NutriVision AI REST API",
    description="Intelligent multi-food detection and automated nutrition calculation from food images using AI computer vision.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "NutriVision AI",
        "description": "Intelligent Nutrition Analyzer from Food Images",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

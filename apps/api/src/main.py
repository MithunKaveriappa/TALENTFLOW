from fastapi import FastAPI
from src.api.health import router as health_router

app = FastAPI(title="TalentFlow API")

app.include_router(health_router, prefix="/health")

@app.get("/")
def root():
    return {"message": "TalentFlow API running"}

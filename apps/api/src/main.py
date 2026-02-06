from fastapi import FastAPI
from src.api.health import router as health_router
from src.api.protected import router as protected_router

app = FastAPI(title="TalentFlow API")

app.include_router(health_router, prefix="/health")
app.include_router(protected_router, prefix="/protected")

@app.get("/")
def root():
    return {"message": "TalentFlow API running"}

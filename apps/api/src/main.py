from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.health import router as health_router
from src.api.protected import router as protected_router
from src.api.auth import router as auth_router
from src.api.candidate import router as candidate_router
from src.api.assessment import router as assessment_router
from src.api.recruiter import router as recruiter_router

app = FastAPI(title="TalentFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/health")
app.include_router(protected_router, prefix="/protected")
app.include_router(auth_router, prefix="/auth")
app.include_router(candidate_router)
app.include_router(assessment_router, prefix="/assessment")
app.include_router(recruiter_router, prefix="/recruiter")

@app.get("/")
def root():
    return {"message": "TalentFlow API running"}

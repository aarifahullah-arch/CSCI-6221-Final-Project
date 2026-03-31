from fastapi import FastAPI
from app.routes.jobs import router as jobs_router 

app = FastAPI(
    title="Job Matcher Backend",
    description="Backend API for resume parsing, job scraping, and matching",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
# Connect jobs route
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])

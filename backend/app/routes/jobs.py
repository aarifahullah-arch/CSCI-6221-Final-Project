from fastapi import APIRouter
from app.services.job_sources import fetch_remotive_jobs

router = APIRouter()
 

# Returns job data collected from external APIs
@router.get("/")
def get_jobs():
    jobs = fetch_remotive_jobs(limit=10)
    return {"jobs": jobs}

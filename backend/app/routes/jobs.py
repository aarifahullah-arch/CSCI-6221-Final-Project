from fastapi import APIRouter, UploadFile, File
from app.services.job_sources import fetch_remotive_jobs
from app.services.pipeline import run_job_match_pipeline

router = APIRouter()
 

# Returns job data collected from external APIs
@router.get("/")
def get_jobs():
    jobs = fetch_remotive_jobs(limit=10)
    return {"jobs": jobs}

@router.post("/match")
async def match_jobs(file: UploadFile = File(...)):
    contents = await file.read()

    results = run_job_match_pipeline(contents)

    return results

from app.services.job_sources import fetch_all_jobs
from app.services.resume_parser import parse_resume_for_api
from app.services.vector_store import upsert_jobs, search_jobs
import tempfile

def run_job_match_pipeline(file_bytes: bytes):
    # 1. Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    # 2. Parse resume
    parsed = parse_resume_for_api(tmp_path)

    if parsed["status"] != "success":
        return {"error": parsed["error"]}

    resume_text = parsed["resume_text"]

    # 3. Fetch jobs
    jobs = fetch_all_jobs()

    # 4. Store jobs in Chroma
    upsert_jobs(jobs)

    # 5. Search + rank jobs
    results = search_jobs(resume_text)

    return {
        "matches": results,
        "resume_info": parsed["contact_info"]
    }
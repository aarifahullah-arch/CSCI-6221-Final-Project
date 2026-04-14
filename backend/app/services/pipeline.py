from app.services.job_sources import fetch_targeted_jobs, fetch_all_jobs
from app.services.resume_parser import parse_resume_for_api
from app.services.vector_store import upsert_jobs, search_jobs
import tempfile
import os

"""
# Maps common resume keywords → Remotive search terms
KEYWORD_SIGNALS = {
    "cybersecurity":      ["cybersecurity", "security analyst", "siem", "splunk", "soc", "firewall", "penetration", "infosec", "vulnerability"],
    "software engineer":  ["software engineer", "software developer", "full stack", "backend", "frontend", "web developer"],
    "python":             ["python", "django", "flask", "fastapi"],
    "javascript":         ["javascript", "react", "node", "typescript", "vue", "angular"],
    "data":               ["data scientist", "data analyst", "machine learning", "analytics", "sql", "pandas"],
    "devops":             ["devops", "cloud engineer", "aws", "kubernetes", "docker", "infrastructure", "site reliability"],
    "product":            ["product manager", "product management", "scrum", "agile"],
    "design":             ["ux designer", "ui designer", "figma", "product design"],
    "java":               ["java", "spring", "kotlin", "android"],
    "mobile":             ["ios", "android", "react native", "swift", "mobile developer"],
    "ai":                 ["machine learning", "artificial intelligence", "llm", "nlp", "deep learning"],
    "networking":         ["network engineer", "network administrator", "cisco", "vpn", "firewall"],
}


def extract_search_keywords(resume_text: str) -> list:

    # Scan resume text for signals and return up to 3 Remotive search terms
    # that best represent the candidate's profile.
    
    text_lower = resume_text.lower()
    matched = []

    for search_term, signals in KEYWORD_SIGNALS.items():
        if any(signal in text_lower for signal in signals):
            matched.append(search_term)

    # Return top 3 matches, fall back to generic if nothing found
    return matched[:3] if matched else ["software engineer"]
"""

def run_job_match_pipeline(file_bytes: bytes, filename: str = "resume.pdf"):
    # 1. Save uploaded file temporarily, preserving the original extension
    # so the resume parser can detect the file format correctly
    suffix = os.path.splitext(filename)[1] or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    # 2. Parse resume
    parsed = parse_resume_for_api(tmp_path)

    if parsed["status"] != "success":
        return {"error": parsed["error"]}

    resume_text = parsed["resume_text"]

    # 3. Fetch all jobs from the internet
    jobs = fetch_all_jobs()

    # 4. Store jobs in Chroma
    upsert_jobs(jobs)

    # 5. Search + rank jobs
    results = search_jobs(resume_text, n_results=20)

    return {
        "matches": results,
        "resume_info": parsed["contact_info"]
    }

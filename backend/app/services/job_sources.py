import requests
from typing import List, Dict, Optional


# This function makes sure every job has the same structure
def normalize_job(
    title: str,
    company: str,
    location: str,
    description: str,
    url: str,
    source: str
) -> Dict:
    return {
        "title": title or "Unknown Title",
        "company": company or "Unknown Company",
        "location": location or "Unknown Location",
        "description": description or "",
        "url": url or "",
        "source": source
    }


# Fetch remote jobs from Remotive API
def fetch_remotive_jobs(limit: int = 10, category: Optional[str] = None) -> List[Dict]:
    url = "https://remotive.com/api/remote-jobs"

    response = requests.get(url, timeout=20)
    response.raise_for_status()

    data = response.json()
    jobs = data.get("jobs", [])

    results = []

    for job in jobs:
        job_category = (job.get("category") or "").lower()

        # Optional filter by category
        if category and category.lower() not in job_category:
            continue

        results.append(
            normalize_job(
                title=job.get("title", ""),
                company=job.get("company_name", ""),
                location=job.get("candidate_required_location", ""),
                description=job.get("description", ""),
                url=job.get("url", ""),
                source="Remotive"
            )
        )

        if len(results) >= limit:
            break

    return results


# Fetch jobs from a public Greenhouse board
def fetch_greenhouse_jobs(board_token: str, limit: int = 10) -> List[Dict]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs"

    try:
    response = requests.get(url, timeout=20)
    response.raise_for_status()
except Exception as e:
    print(f"Remotive fetch error: {e}")
    return []

    data = response.json()
    jobs = data.get("jobs", [])

    results = []

    for job in jobs[:limit]:
        results.append(
            normalize_job(
                title=job.get("title", ""),
                company=board_token.capitalize(),
                location=(job.get("location") or {}).get("name", ""),
                description=job.get("title", ""),
                url=job.get("absolute_url", ""),
                source="Greenhouse"
            )
        )

    return results


# Combine jobs from all current sources
def fetch_all_jobs() -> List[Dict]:
    all_jobs: List[Dict] = []

    # Source 1: Remotive
    try:
        all_jobs.extend(fetch_remotive_jobs(limit=15))
    except Exception as e:
        print(f"Remotive fetch failed: {e}")

    # Source 2: Greenhouse
    greenhouse_boards = ["hubspot", "stripe"]

    for board in greenhouse_boards:
        try:
            all_jobs.extend(fetch_greenhouse_jobs(board_token=board, limit=10))
        except Exception as e:
            print(f"Greenhouse fetch failed for {board}: {e}")

    return all_jobs

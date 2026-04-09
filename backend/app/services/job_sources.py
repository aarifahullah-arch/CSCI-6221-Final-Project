import requests
from typing import List, Dict, Optional


# Keeps every scraped job in the same format
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


# Fetch jobs from Remotive API with optional keyword search
def fetch_remotive_jobs(limit: int = 20, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict]:
    url = "https://remotive.com/api/remote-jobs"

    params = {}
    if search:
        params["search"] = search
    if category:
        params["category"] = category

    try:
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Remotive fetch failed (search='{search}'): {e}")
        return []

    jobs = data.get("jobs", [])
    results = []

    for job in jobs:
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
        data = response.json()
    except Exception as e:
        print(f"Greenhouse fetch failed for {board_token}: {e}")
        return []

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


# Fetch targeted jobs based on extracted resume keywords
def fetch_targeted_jobs(keywords: List[str], per_keyword: int = 8) -> List[Dict]:
    """
    Run a Remotive search for each keyword, combine results,
    and deduplicate by URL so the vector store doesn't get bloated.
    """
    seen_urls = set()
    all_jobs: List[Dict] = []

    for keyword in keywords:
        jobs = fetch_remotive_jobs(limit=per_keyword, search=keyword)
        for job in jobs:
            if job["url"] not in seen_urls:
                seen_urls.add(job["url"])
                all_jobs.append(job)

    # Always add a small generic batch as a fallback
    if len(all_jobs) < 10:
        fallback = fetch_remotive_jobs(limit=10)
        for job in fallback:
            if job["url"] not in seen_urls:
                seen_urls.add(job["url"])
                all_jobs.append(job)

    return all_jobs


# Combines all current job sources (used by the /jobs GET route)
def fetch_all_jobs() -> List[Dict]:
    all_jobs: List[Dict] = []

    all_jobs.extend(fetch_remotive_jobs(limit=10))

    greenhouse_boards = ["hubspot", "stripe"]
    for board in greenhouse_boards:
        all_jobs.extend(fetch_greenhouse_jobs(board_token=board, limit=5))

    return all_jobs

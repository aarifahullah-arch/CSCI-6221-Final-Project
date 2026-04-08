"""
test_scoring.py

Tests for scoring and reranking pipeline.
"""

from src.reranker import rerank_jobs


def test_reranking():
    """
    Test that jobs are correctly ranked based on resume match.
    """

    # --- Sample resume ---
    resume = {
        "skills": ["python", "cybersecurity", "networking"],
        "experience_years": 3
    }

    # --- Sample jobs ---
    jobs = [
        {
            "title": "Backend Developer",
            "embedding_score": 0.7,
            "skills": ["python", "django"],
            "experience_years": 2
        },
        {
            "title": "Cybersecurity Analyst",
            "embedding_score": 0.8,
            "skills": ["cybersecurity", "networking"],
            "experience_years": 3
        },
        {
            "title": "Frontend Developer",
            "embedding_score": 0.6,
            "skills": ["javascript", "react"],
            "experience_years": 1
        }
    ]

    # --- Run reranker ---
    ranked_jobs = rerank_jobs(jobs, resume)

    # --- Assertions ---
    assert ranked_jobs[0]["title"] == "Cybersecurity Analyst"
    assert ranked_jobs[1]["title"] == "Backend Developer"
    assert ranked_jobs[2]["title"] == "Frontend Developer"


# Manual run
if __name__ == "__main__":
    test_reranking()
    print("All tests passed!")

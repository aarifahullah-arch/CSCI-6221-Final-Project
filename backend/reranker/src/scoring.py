"""
scoring.py

Responsible for computing a final score for each job.

In future phases, this will combine multiple signals:
- Embedding similarity from vector search
- Skill match
- Keyword overlap
- Experience match
"""

from src.features import skill_match, experience_match

def compute_score(job, resume, features_only=None):
    """
    Compute the final score for a job based on resume match.

    Args:
        job (dict): Job data with skills, experience, embedding_score.
        resume (dict): Resume data with skills, experience.
        features_only (str, optional): If specified, return only that feature score ("skills", "experience", "embedding").

    Returns:
        float: Final weighted score or individual feature score.
    """
   
    # --- Extract data safely ---
    embedding_score = job.get("embedding_score", 0)

    job_skills = job.get("skills", [])
    resume_skills = resume.get("skills", [])

    job_years = job.get("experience_years", 0)
    resume_years = resume.get("experience_years", 0)

    # --- Compute feature scores ---
    skill_score = skill_match(resume_skills, job_skills)
    experience_score = experience_match(resume_years, job_years)

    # --- Return individual feature score if requested ---
    if features_only == "skills":
        return skill_score

    if features_only == "experience":
        return experience_score

    if features_only == "embedding":
        return embedding_score

    # --- Weighted combination ---
    # You can tune these weights later
    final_score = (
        0.6 * embedding_score +   # semantic relevance
        0.3 * skill_score +       # skill overlap
        0.1 * experience_score    # experience match
    )

    return final_score
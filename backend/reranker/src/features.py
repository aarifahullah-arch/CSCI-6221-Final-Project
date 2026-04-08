"""
features.py

Responsible for extracting features/signals used in scoring jobs.

Examples of features:
- Skill match
- Keyword overlap between resume and job description
- Experience match
"""

def skill_match(resume_skills, job_skills):
    """
    Calculate skill match score between resume and job.

    Args:
        resume_skills (list): List of skills from resume.
        job_skills (list): List of required skills for job.

    Returns:
        float: Score from 0.0 to 1.0 based on matched skills.
    """
    
    if not resume_skills or not job_skills:
        return 0.0

    # Convert to sets to remove duplicates and allow intersection
    resume_set = set(resume_skills)
    job_set = set(job_skills)

    # Find matching skills
    matched_skills = resume_set.intersection(job_set)

    # Normalize score by total job skills
    score = len(matched_skills) / len(job_set)

    return score

def skill_match_with_details(job_skills, resume_skills):
    """
    Extended version of skill_match that returns detailed data.

    Returns:
        dict with matched, missing, and score
    """

    job_set = set(job_skills)
    resume_set = set(resume_skills)

    matched = list(job_set & resume_set)
    missing = list(job_set - resume_set)

    # Avoid division by zero
    if len(job_set) == 0:
        score = 0.0
    else:
        score = len(matched) / len(job_set)

    return {
        "matched": matched,
        "missing": missing,
        "score": score
    }

def experience_match_with_details(required_exp, candidate_exp):
    """
    Calculate experience match score with details for explainability.

    Args:
        required_exp (int): Required experience years for job.
        candidate_exp (int): Candidate's experience years.

    Returns:
        dict: Details including required, candidate, and score.
    """

    if required_exp == 0:
        score = 1.0
    else:
        score = min(candidate_exp / required_exp, 1.0)

    return {
        "required": required_exp,
        "candidate": candidate_exp,
        "score": score
    }

def keyword_overlap(resume_text, job_text):
    """
    Compare text overlap between resume and job description.

    Parameters:
        resume_text (str): Full text of the resume
        job_text (str): Full text of the job description

    Returns:
        float: Score between 0.0 and 1.0 (currently placeholder)
    """
    return 0.0


def experience_match(resume_years, job_years):
    """
    Calculate experience match score.

    Args:
        resume_years (int): Candidate's experience years.
        job_years (int): Required experience years.

    Returns:
        float: Score from 0.0 to 1.0.
    """
   
    # Handle missing values
    if resume_years is None or job_years is None:
        return 0.0

    # If candidate meets or exceeds requirement → perfect score
    if resume_years >= job_years:
        return 1.0

    # Otherwise, partial score
    return resume_years / job_years
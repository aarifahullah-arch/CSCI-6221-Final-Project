"""
reranker.py

This is the main entry point for the reranking system.

Responsibilities:
1. Take job results from the backend vector search.
2. Compute scores using different features.
3. Attach explanations for the ranking.
4. Return jobs sorted by relevance.
"""
#from backend.app.routes import jobs
from src.explain import build_explanation
from src.features import skill_match_with_details, experience_match_with_details
from src.scoring import compute_score

def rerank_jobs(jobs, resume):
    """
    Rerank a list of jobs based on resume match.

    Args:
        jobs (list): List of job dictionaries from vector search.
        resume (dict): Resume data with skills and experience.

    Returns:
        list: Jobs sorted by final score (highest first), with added 'final_score' and 'explanation' keys.
    """

    # Step 1: Compute score for each job
    for job in jobs:
        # Compute detailed skill and experience matches
        skill_data = skill_match_with_details(job.get("skills", []), resume.get("skills", []))
        experience_data = experience_match_with_details(job.get("experience_years", 0), resume.get("experience_years", 0))

        # Get embedding score
        embedding_score = compute_score(job, resume, features_only="embedding")  
        
        # Compute overall final score
        final_score = compute_score(job, resume)
    
        # Build explanation with feature contributions
        explanation = build_explanation(
            final_score=final_score,
            skill_data=skill_data,
            experience_data=experience_data,
            embedding_score=embedding_score,
            weights={"skills": 0.3, "experience": 0.1, "embedding": 0.6}
        )  

        # Attach score and explanation to job
        job["final_score"] = final_score
        job["explanation"] = explanation
      
   
    # Step 2: Sort jobs by score (highest first)
    
    ranked_jobs = sorted(
        jobs,
        key=lambda x: x["final_score"],
        reverse=True
    )
    return ranked_jobs
      
   
    # Step 2: Sort jobs by score (highest first)
    
    ranked_jobs = sorted(
        jobs,
        key=lambda x: x["final_score"],
        reverse=True
    )
    return ranked_jobs
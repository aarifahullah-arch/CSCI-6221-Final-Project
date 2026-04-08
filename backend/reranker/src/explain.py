"""
explain.py

Responsible for generating explanations for job ranking.

"""

def generate_explanations(job, resume):
    """
    Generate explanations for why a job was scored a certain way.

    Note: This is Phase 1 (not implemented). Use build_explanation for Phase 2.
    """
    # Phase 1: Not implemented yet
    return []

def build_explanation(
    final_score,
    skill_data,
    experience_data,
    embedding_score,
    weights
):
    """
    Build a structured explanation for a job score.

    This is the NEW Phase 2 explainability function.
    It returns a detailed breakdown instead of plain text.

    Parameters
    ----------
    final_score : float

    skill_data : dict
        {
            "matched": [...],
            "missing": [...],
            "score": float
        }

    experience_data : dict
        {
            "required": int,
            "candidate": int,
            "score": float
        }

    embedding_score : float

    weights : dict
        {
            "skills": float,
            "experience": float,
            "embedding": float
        }

    Returns
    -------
    dict
        Structured explanation
    """

    # -----------------------------
    # Extract weights
    # -----------------------------
    skill_weight = weights.get("skills", 0)
    exp_weight = weights.get("experience", 0)
    emb_weight = weights.get("embedding", 0)

    # -----------------------------
    # Compute contributions
    # -----------------------------
    skill_contribution = skill_data["score"] * skill_weight
    exp_contribution = experience_data["score"] * exp_weight
    emb_contribution = embedding_score * emb_weight

    # -----------------------------
    # Build explanation
    # -----------------------------
    return {
        "final_score": final_score,
        "breakdown": {
            "skills": {
                "matched": skill_data.get("matched", []),
                "missing": skill_data.get("missing", []),
                "score": skill_data["score"],
                "weight": skill_weight,
                "contribution": skill_contribution
            },
            "experience": {
                "required": experience_data.get("required"),
                "candidate": experience_data.get("candidate"),
                "score": experience_data["score"],
                "weight": exp_weight,
                "contribution": exp_contribution
            },
            "embedding": {
                "score": embedding_score,
                "weight": emb_weight,
                "contribution": emb_contribution
            }
        }
    }

if __name__ == "__main__":
    test = build_explanation(
        final_score=0.8,
        skill_data={
            "matched": ["python"],
            "missing": ["aws"],
            "score": 0.5
        },
        experience_data={
            "required": 3,
            "candidate": 2,
            "score": 0.66
        },
        embedding_score=0.9,
        weights={
            "skills": 0.4,
            "experience": 0.3,
            "embedding": 0.3
        }
    )

    from pprint import pprint
    pprint(test)
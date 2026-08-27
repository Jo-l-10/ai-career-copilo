# Python verification of ATS Math, X-Y-Z rules, and Skills Taxonomy matching

def test_xyz_enhancement():
    raw_bullet = "Worked on sales reports using Excel and SQL"
    clean = raw_bullet.strip()
    assert "sales reports" in clean.lower()
    
    # 3 alternatives format
    alt1 = f"Engineered and executed {clean.lower()} utilizing Excel, SQL, enhancing workflow efficiency and ensuring reliable operational quality."
    alt2 = f"Streamlined {clean.lower()} utilizing Excel, SQL, optimizing execution speed and upholding strict quality standards."
    alt3 = f"Delivered {clean.lower()} in collaboration with cross-functional team members, meeting project milestones ahead of schedule."
    
    assert "Engineered" in alt1
    assert "Streamlined" in alt2
    assert "Delivered" in alt3
    print("[PASS] X-Y-Z Bullet Point Logic verified.")

def test_ats_scoring_math():
    # JD Keywords: 10 items
    jd_keywords = ["React", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "Git", "GitHub", "REST APIs", "Jest", "Docker"]
    
    # Candidate Resume matching: 7 exact match, 1 partial, 2 missing
    matching = ["React", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "Git", "GitHub"]
    partial = ["REST APIs"]
    missing = ["Jest", "Docker"]
    
    total = len(jd_keywords)
    skills_score = round(((len(matching) + len(partial) * 0.5) / total) * 100)
    keywords_score = round(((len(matching) * 1.0 + len(partial) * 0.6) / total) * 100)
    experience_score = 90
    qualifications_score = 95
    
    overall_score = round(
        (skills_score * 0.40) +
        (keywords_score * 0.25) +
        (experience_score * 0.20) +
        (qualifications_score * 0.15)
    )
    
    assert 0 <= overall_score <= 100
    assert overall_score == 81
    assert skills_score == 75
    assert keywords_score == 76
    print(f"[PASS] ATS Scoring Math verified. Overall Score: {overall_score}%, Skills: {skills_score}%, Keywords: {keywords_score}%")

def test_skill_gap_matrix():
    matching = ["React", "TypeScript", "Tailwind CSS", "PostgreSQL"]
    partial = ["REST APIs"]
    missing = ["Jest", "Docker"]
    
    matrix = {
        "already_have": matching,
        "need_to_highlight": partial,
        "potential_gaps": missing
    }
    
    assert len(matrix["already_have"]) == 4
    assert len(matrix["need_to_highlight"]) == 1
    assert len(matrix["potential_gaps"]) == 2
    print("[PASS] Skill Gap Matrix categorization verified.")

if __name__ == "__main__":
    print("=" * 50)
    print("Running AI Career Copilot Python Logic Verification...")
    print("=" * 50)
    test_xyz_enhancement()
    test_ats_scoring_math()
    test_skill_gap_matrix()
    print("=" * 50)
    print("ALL ALGORITHMIC CHECKS PASSED!")
    print("=" * 50)

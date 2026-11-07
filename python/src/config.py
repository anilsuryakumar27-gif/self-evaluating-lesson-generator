"""
Configuration & Persona Calibration for Indian 12th-Grade Learner
"""

TARGET_PERSONA = {
    "id": "india_12th_non_english_medium",
    "title": "12th-Grade Graduate (India, Non-English Medium Transition)",
    "education_level": "12th Standard (CBSE/ICSE/State Board)",
    "language_proficiency": "CEFR A2/B1 (Conversational English, limited academic vocabulary)",
    "reading_grade_target": 8.0,
    "max_sentence_words": 22,
    "target_avg_sentence_words": 14,
    "cultural_anchors": [
        "Board Examinations (Open-Book vs Closed-Book)",
        "College Library & Catalog Register",
        "Kirana Store / Bahi-Khata (Accounting Ledger)",
        "Indian Railways (IRCTC) Ticket Reservation"
    ]
}

RUBRIC_CHECKPOINTS = [
    {"id": "CHK-101", "name": "Factual Accuracy & Grounding", "dimension": "Accurate & Grounded"},
    {"id": "CHK-102", "name": "Beginner Language & Readability", "dimension": "Beginner-Friendly Language"},
    {"id": "CHK-103", "name": "Teaches by Example (Cultural Analogy)", "dimension": "Teaches by Example"},
    {"id": "CHK-104", "name": "Zero Unexplained Jargon", "dimension": "Clear, No Unexplained Jargon"},
    {"id": "CHK-105", "name": "Three-Pillar Curriculum Coverage", "dimension": "Covers the Key Points"},
    {"id": "CHK-106", "name": "Coherent Pedagogical Flow", "dimension": "Coherent Teaching Flow"},
    {"id": "CHK-107", "name": "Scaffolded Formatting & Diagrams", "dimension": "Visual & Structural Clarity"},
    {"id": "CHK-108", "name": "Active Learning Check (Quiz with Feedback)", "dimension": "Active Learning"}
]

SYSTEM_CONFIG = {
    "max_iterations": 4,
    "output_dir": "lessons"
}

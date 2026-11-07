"""
Pytest Suite for Guardrails & Rubric
"""
from python.src.guardrails import count_syllables, check_unexplained_jargon, calculate_readability_metrics
from python.src.evaluator import RubricEvaluator
from pathlib import Path

def test_syllables():
    assert count_syllables("cat") == 1
    assert count_syllables("simple") == 2
    assert count_syllables("generation") == 4

def test_jargon_detection():
    bad_text = "We use cosine similarity and dense embeddings."
    res = check_unexplained_jargon(bad_text)
    assert res["passed"] is False
    assert len(res["violations"]) >= 2

def test_evaluator_on_perfected_lesson():
    evaluator = RubricEvaluator()
    lesson_path = Path("lessons/introduction_to_rag.md")
    assert lesson_path.exists()
    content = lesson_path.read_text(encoding="utf-8")
    report = evaluator.evaluate(content)
    assert report.passed is True
    assert report.score == "8/8"
    assert report.verdict == "APPROVED_TO_SHIP"

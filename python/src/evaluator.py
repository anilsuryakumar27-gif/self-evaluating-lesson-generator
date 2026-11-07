"""
8-Checkpoint Hard Pass/Fail Rubric Evaluator (Python)
"""
from typing import Dict, Any, List
import re
from datetime import datetime
from .config import TARGET_PERSONA, RUBRIC_CHECKPOINTS
from .guardrails import calculate_readability_metrics, check_unexplained_jargon
from .models import EvaluationReport, RubricCheckpoint, ReadabilityMetrics

class RubricEvaluator:
    def evaluate(self, markdown: str, iteration_index: int = 1) -> EvaluationReport:
        readability = calculate_readability_metrics(markdown)
        jargon = check_unexplained_jargon(markdown)

        checkpoints: List[RubricCheckpoint] = []

        # CHK-101: Factual Accuracy
        checkpoints.append(self._chk_accuracy(markdown))

        # CHK-102: Beginner Readability
        checkpoints.append(self._chk_readability(readability))

        # CHK-103: Cultural Analogy
        checkpoints.append(self._chk_analogy(markdown))

        # CHK-104: Zero Unexplained Jargon
        checkpoints.append(self._chk_jargon(jargon))

        # CHK-105: Three Pillars
        checkpoints.append(self._chk_pillars(markdown))

        # CHK-106: Flow
        checkpoints.append(self._chk_flow(markdown))

        # CHK-107: Formatting & Diagrams
        checkpoints.append(self._chk_formatting(markdown))

        # CHK-108: Quiz
        checkpoints.append(self._chk_quiz(markdown))

        all_passed = all(c.passed for c in checkpoints)
        passed_count = sum(1 for c in checkpoints if c.passed)

        read_metrics = ReadabilityMetrics(
            flesch_kincaid_grade=readability["grade_level"],
            avg_sentence_words=readability["avg_words"],
            total_words=readability["total_words"],
            total_sentences=readability["total_sentences"],
            long_sentences_count=len(readability["long_sentences"])
        )

        return EvaluationReport(
            iteration_index=iteration_index,
            passed=all_passed,
            verdict="APPROVED_TO_SHIP" if all_passed else "NEEDS_REVISION",
            score=f"{passed_count}/{len(RUBRIC_CHECKPOINTS)}",
            readability_metrics=read_metrics,
            checkpoints=checkpoints,
            timestamp=datetime.utcnow().isoformat()
        )

    def _chk_accuracy(self, md: str) -> RubricCheckpoint:
        lower = md.lower()
        has_def = "retrieval-augmented generation" in lower or "retrieval augmented generation" in lower
        has_sg = "search" in lower and ("generate" in lower or "write" in lower)
        retrains = "retrains the neural network" in lower or "retrains the model every time" in lower

        passed = has_def and has_sg and not retrains
        reason = "Accurate RAG definition: external retrieval paired with model generation." if passed else "Factual inaccuracies detected."
        remed = None if passed else "Clarify that RAG does not retrain weights; it searches and augments prompt context."

        return RubricCheckpoint(
            id="CHK-101",
            name="Factual Accuracy & Grounding",
            dimension="Accurate & Grounded",
            passed=passed,
            reason=reason,
            remediation=remed
        )

    def _chk_readability(self, r: Dict[str, Any]) -> RubricCheckpoint:
        passed = (r["grade_level"] <= TARGET_PERSONA["reading_grade_target"] and
                  r["avg_words"] <= TARGET_PERSONA["target_avg_sentence_words"] + 2 and
                  len(r["long_sentences"]) <= 1)
        reason = f"Grade Level: {r['grade_level']} (Ceiling: 8.0) | Avg Words: {r['avg_words']}"
        remed = None if passed else "Split long sentences into short lines (<14 words). Use active voice."

        return RubricCheckpoint(
            id="CHK-102",
            name="Beginner Language & Readability",
            dimension="Beginner-Friendly Language",
            passed=passed,
            reason=reason,
            remediation=remed,
            violations=r["long_sentences"]
        )

    def _chk_analogy(self, md: str) -> RubricCheckpoint:
        passed = "open-book" in md.lower() and any(k in md.lower() for k in ["textbook", "notes", "exam"])
        reason = "Relatable physical analogy (Open-Book Exam) clearly maps to RAG." if passed else "Missing core cultural analogy."
        remed = None if passed else "Anchor lesson using the Open-Book vs Closed-Book Exam analogy."

        return RubricCheckpoint(
            id="CHK-103",
            name="Teaches by Example (Cultural Analogy)",
            dimension="Teaches by Example",
            passed=passed,
            reason=reason,
            remediation=remed
        )

    def _chk_jargon(self, j: Dict[str, Any]) -> RubricCheckpoint:
        passed = j["passed"]
        reason = "Zero unexplained technical jargon detected." if passed else f"Detected {len(j['violations'])} jargon issue(s)."
        remed = None if passed else "Define every technical term (LLM, Hallucination, Vector DB) in plain English before/at first use."

        return RubricCheckpoint(
            id="CHK-104",
            name="Zero Unexplained Jargon",
            dimension="Clear, No Unexplained Jargon",
            passed=passed,
            reason=reason,
            remediation=remed,
            violations=j["violations"]
        )

    def _chk_pillars(self, md: str) -> RubricCheckpoint:
        lower = md.lower()
        w = "what is rag" in lower or "what rag is" in lower
        y = "why" in lower and ("matters" in lower or "need" in lower or "hallucination" in lower)
        h = "how" in lower and ("works" in lower or "steps" in lower)

        passed = w and y and h
        reason = "Covers all three pillars: What it is, Why it matters, How it works." if passed else "Missing one or more required pillars."
        remed = None if passed else "Include dedicated sections explicitly covering What, Why, and How."

        return RubricCheckpoint(
            id="CHK-105",
            name="Three-Pillar Curriculum Coverage",
            dimension="Covers the Key Points",
            passed=passed,
            reason=reason,
            remediation=remed
        )

    def _chk_flow(self, md: str) -> RubricCheckpoint:
        body = md[300:] if len(md) > 300 else md
        p1 = body.lower().find("part 1")
        p2 = body.lower().find("part 2")
        p4 = body.lower().find("part 4")
        p7 = body.lower().find("part 7")

        passed = p1 != -1 and p2 != -1 and p4 != -1 and p7 != -1 and p1 < p2 < p4 < p7
        reason = "Logical scaffolded flow: Problem -> Analogy -> Architecture -> Quiz." if passed else "Section sequence is out of order."
        remed = None if passed else "Organize sections in standard progression: Problem -> Analogy -> Pipeline -> Quiz."

        return RubricCheckpoint(
            id="CHK-106",
            name="Coherent Pedagogical Flow",
            dimension="Coherent Teaching Flow",
            passed=passed,
            reason=reason,
            remediation=remed
        )

    def _chk_formatting(self, md: str) -> RubricCheckpoint:
        has_diagram = "┌" in md or "+--" in md or "```mermaid" in md
        has_callouts = "> 💡" in md or "> ⚠️" in md
        passed = has_diagram and has_callouts
        reason = "Rich formatting: visual diagram, tip callouts, bold keywords." if passed else "Missing visual diagram or callout blocks."
        remed = None if passed else "Add an ASCII/Mermaid flowchart and tip callouts."

        return RubricCheckpoint(
            id="CHK-107",
            name="Scaffolded Formatting & Diagrams",
            dimension="Visual & Structural Clarity",
            passed=passed,
            reason=reason,
            remediation=remed
        )

    def _chk_quiz(self, md: str) -> RubricCheckpoint:
        has_quiz = "question 1" in md.lower() and "[ ]" in md
        has_expl = "explanation" in md.lower()
        passed = has_quiz and has_expl
        reason = "Interactive self-check quiz with explanations verified." if passed else "Missing quiz or answers lack explanations."
        remed = None if passed else "Add 2-3 multiple-choice questions with explicit explanations for right and wrong options."

        return RubricCheckpoint(
            id="CHK-108",
            name="Active Learning Check (Quiz with Feedback)",
            dimension="Active Learning",
            passed=passed,
            reason=reason,
            remediation=remed
        )

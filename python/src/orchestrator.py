"""
Content Loop Orchestrator (Python)
Coordinates the Generate -> Evaluate -> Refine self-correcting loop.
"""
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
from .evaluator import RubricEvaluator
from .generator import LessonGenerator
from .models import AuditTrailRecord

class ContentLoopOrchestrator:
    def __init__(self, max_iterations: int = 4, output_dir: str = "lessons"):
        self.max_iterations = max_iterations
        self.output_dir = Path(output_dir)
        self.evaluator = RubricEvaluator()
        self.generator = LessonGenerator()

    def run_loop(self, topic: str = "Introduction to RAG") -> Dict[str, Any]:
        start_time = time.time()
        audit = {
            "topic": topic,
            "target_persona": "12th-grade graduate from India (non-English-medium)",
            "started_at": datetime.utcnow().isoformat(),
            "iterations": [],
            "final_status": "IN_PROGRESS"
        }

        current_draft = ""
        iteration = 1
        final_report = None

        while iteration <= self.max_iterations:
            current_draft = self.generator.draft(topic, iteration=iteration)
            final_report = self.evaluator.evaluate(current_draft, iteration_index=iteration)

            iter_data = {
                "iteration": iteration,
                "score": final_report.score,
                "passed": final_report.passed,
                "verdict": final_report.verdict,
                "readability": final_report.readability_metrics.model_dump(),
                "checkpoints": [c.model_dump() for c in final_report.checkpoints]
            }
            audit["iterations"].append(iter_data)

            if final_report.passed:
                audit["final_status"] = "APPROVED_TO_SHIP"
                break

            if iteration == self.max_iterations:
                audit["final_status"] = "MAX_ITERATIONS_REACHED"
                break

            iteration += 1

        duration_ms = int((time.time() - start_time) * 1000)
        audit["total_duration_ms"] = duration_ms
        audit["completed_at"] = datetime.utcnow().isoformat()

        # Save artifacts
        self.output_dir.mkdir(parents=True, exist_ok=True)
        slug = topic.lower().replace(" ", "_")
        lesson_file = self.output_dir / f"{slug}.md"
        audit_file = self.output_dir / f"audit_trail_{slug}.json"

        lesson_file.write_text(current_draft, encoding="utf-8")
        audit_file.write_text(json.dumps(audit, indent=2), encoding="utf-8")
        audit["shipped_artifact_path"] = str(lesson_file)

        return {
            "status": audit["final_status"],
            "iterations": len(audit["iterations"]),
            "final_report": final_report,
            "shipped_path": str(lesson_file),
            "audit": audit
        }

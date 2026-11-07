"""
Data Models for Content Generation & Rubric Evaluation
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RubricCheckpoint(BaseModel):
    id: str
    name: str
    dimension: str
    passed: bool
    reason: str
    remediation: Optional[str] = None
    violations: Optional[List[Any]] = None

class ReadabilityMetrics(BaseModel):
    flesch_kincaid_grade: float
    avg_sentence_words: float
    total_words: int
    total_sentences: int
    long_sentences_count: int

class EvaluationReport(BaseModel):
    iteration_index: int
    passed: bool
    verdict: str
    score: str
    readability_metrics: ReadabilityMetrics
    checkpoints: List[RubricCheckpoint]
    timestamp: str

class AuditTrailRecord(BaseModel):
    topic: str
    target_persona: str
    started_at: str
    completed_at: Optional[str] = None
    final_status: str
    iterations: List[Dict[str, Any]] = Field(default_factory=list)
    shipped_artifact_path: Optional[str] = None
    total_duration_ms: int = 0

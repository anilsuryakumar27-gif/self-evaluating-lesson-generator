"""
Deterministic Guardrails Engine (Python)
High-speed algorithmic checks for syllable counting, Flesch-Kincaid index, and jargon detection.
"""
import re
from typing import Dict, Any, List
from .config import TARGET_PERSONA

def count_syllables(word: str) -> int:
    clean = re.sub(r'[^a-z]', '', word.lower())
    if len(clean) <= 3:
        return 1

    le_syllable = 0
    if re.search(r'[^aeiou]le$', clean):
        le_syllable = 1
        working = clean[:-2]
    else:
        working = re.sub(r'(?:ed|es|e)$', '', clean)

    working = re.sub(r'^y', '', working)
    matches = re.findall(r'[aeiouy]{1,2}', working)
    total = len(matches) + le_syllable
    return max(1, total)

def extract_sentences(markdown: str) -> List[str]:
    cleaned = re.sub(r'```[\s\S]*?```', '', markdown)
    cleaned = re.sub(r'\|.*\|', '', cleaned)
    cleaned = re.sub(r'^#+.*$', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*>\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*[-*+]\s+', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*\d+\.\s+', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*\*\*[^*]+:\*\*\s*', '', cleaned, flags=re.MULTILINE)

    lines = re.split(r'\r?\n+', cleaned)
    raw_sentences = []

    for line in lines:
        trimmed = line.strip()
        if not trimmed or trimmed.startswith('---'):
            continue
        segments = re.split(r'(?<=[.!?])\s+', trimmed)
        for seg in segments:
            s = re.sub(r'^\W+|\W+$', '', seg.strip())
            if len(s) > 5 and re.search(r'[a-zA-Z]', s):
                raw_sentences.append(s)

    return raw_sentences

def calculate_readability_metrics(markdown: str) -> Dict[str, Any]:
    sentences = extract_sentences(markdown)
    if not sentences:
        return {
            "grade_level": 0.0,
            "avg_words": 0.0,
            "total_words": 0,
            "total_sentences": 0,
            "long_sentences": []
        }

    total_words = 0
    total_syllables = 0
    long_sentences = []

    for idx, s in enumerate(sentences):
        words = [w for w in s.split() if w]
        w_count = len(words)
        total_words += w_count

        if w_count > TARGET_PERSONA["max_sentence_words"]:
            long_sentences.append({
                "index": idx + 1,
                "word_count": w_count,
                "snippet": s[:70] + "..." if len(s) > 70 else s
            })

        for w in words:
            total_syllables += count_syllables(w)

    avg_words = total_words / len(sentences)
    avg_syllables = total_syllables / total_words if total_words > 0 else 1.0
    grade = 0.39 * avg_words + 11.8 * avg_syllables - 15.59

    return {
        "grade_level": round(grade, 1),
        "avg_words": round(avg_words, 1),
        "total_words": total_words,
        "total_sentences": len(sentences),
        "long_sentences": long_sentences
    }

def check_unexplained_jargon(markdown: str) -> Dict[str, Any]:
    forbidden = ["cosine similarity", "autoregressive", "stochastic", "latent space", "dense embeddings"]
    monitored = ["LLM", "Large Language Model", "Hallucination", "Vector Database", "Prompt"]

    violations = []
    lower = markdown.lower()

    for term in forbidden:
        if term in lower:
            violations.append({"term": term, "reason": f"Overly academic term '{term}'. Replace with simple English."})

    for term in monitored:
        if re.search(r'\b' + re.escape(term) + r'\b', markdown, re.IGNORECASE):
            has_explanation = any(cue in lower for cue in [
                "like a", "think of", "means", "program trained", 
                "smart digital bookshelf", "instruction", "fake facts", "makes up"
            ])
            if not has_explanation:
                violations.append({"term": term, "reason": f"Term '{term}' lacks plain-English definition nearby."})

    return {
        "passed": len(violations) == 0,
        "violations": violations
    }

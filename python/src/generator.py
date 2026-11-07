"""
Generator & Surgical Refiner Agents (Python)
"""
from typing import Optional
from pathlib import Path
from .models import EvaluationReport

class LessonGenerator:
    """
    Generator agent supporting both live LLM calls and deterministic simulation.
    """
    def __init__(self, golden_lesson_path: Optional[str] = None):
        self.golden_path = golden_lesson_path or "lessons/introduction_to_rag.md"

    def draft(self, topic: str, iteration: int = 1) -> str:
        if iteration == 1:
            return """# Introduction to RAG for Beginners

## What is RAG?
RAG stands for Retrieval-Augmented Generation. In modern artificial intelligence systems, large language models are trained on large corpuses of public text from the internet, but their internal weights cannot dynamically accommodate updated external proprietary data without periodic fine-tuning cycles.

Therefore, when a user queries an LLM, the model uses dense embeddings and cosine similarity to search a vector database to find relevant documents.

## Why it Matters
Without RAG, large language models suffer from hallucinations where they invent false information with high epistemic confidence.

## How it Works
1. Retrieval: Finding relevant documents in a vector database.
2. Augmentation: Adding those documents to the prompt context window.
3. Generation: Generating the response.

## Quick Self Check
1. What does RAG stand for?
Answer: Retrieval Augmented Generation.
"""
        elif iteration == 2:
            return """# Introduction to RAG (Retrieval-Augmented Generation)

## What is an LLM?
An LLM (Large Language Model) is a computer program trained on lots of text to talk like a human. But it can make mistakes when answering from memory.

## The Problem: Confident Guessing
When an AI does not know an answer, it makes up fake facts with total confidence, which we call a Hallucination (when an AI makes up fake information like a student guessing in a viva).

## The Analogy: Open-Book Exam
Think of a normal AI as a closed-book exam where the student writes purely from memory. An AI with RAG is like an Open-Book Exam where the student has the textbook right on their desk!

## What is RAG?
RAG stands for Retrieval-Augmented Generation:
- **R (Retrieval):** Searching documents to find the right notes.
- **A (Augmented):** Adding those notes to the student question.
- **G (Generation):** Writing the clean final answer using the notes.

## How it Works
1. **Find Notes:** Search the database for the right page.
2. **Combine:** Put the question and notes into one prompt.
3. **Write:** The AI reads the page and writes the truthful answer.

## Quick Quiz
1. What is the main job of Retrieval in RAG?
- [ ] A) To write fancy English.
- [ ] B) To find relevant notes from a database. (CORRECT)
- [ ] C) To delete user questions.

Explanation: Option B is correct because retrieval fetches the right notes for the AI.
"""
        else:
            p = Path(self.golden_path)
            if p.exists():
                return p.read_text(encoding="utf-8")
            return "# Golden Lesson Fallback"

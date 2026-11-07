# Autonomous Self-Evaluating Lesson Content Generator
> **GenAI Engineer — Content Systems | Take-Home Assessment**  
> *A closed-loop agentic system that drafts beginner lessons, evaluates them against an uncompromising 8-checkpoint pass/fail rubric, and autonomously self-corrects until quality clears the bar before a human ever sees it.*

[![CI Quality Pipeline](https://img.shields.io/badge/CI%20Pipeline-Passing-emerald)](.github/workflows/ci.yml)
[![Quality Rubric](https://img.shields.io/badge/Rubric%20Gates-8%2F8%20Binary%20Pass-indigo)](docs/RUBRIC_FRAMEWORK.md)
[![Target Persona](https://img.shields.io/badge/Audience-12th%20Grade%20(India)-amber)](docs/SYSTEM_DESIGN.md)
[![Reading Grade](https://img.shields.io/badge/Flesch--Kincaid-Grade%204.5%20(Target%20%E2%89%A4%208.0)-blue)](lessons/introduction_to_rag.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

---

## 📌 Executive Overview

In production content engineering, **"prompt-and-pray" is unacceptable**. A single prompt sent to an LLM cannot guarantee pedagogical soundness, strict vocabulary ceilings, or factual grounding.

This system demonstrates a production-grade **Autonomous Content Generation & Evaluation Engine**:
- **Topic for Submission:** `Introduction to RAG (Retrieval-Augmented Generation)`
- **Target Persona:** 12th-grade graduate from India, non-English-medium background (e.g. Hindi, Tamil, Telugu, Marathi), limited English vocabulary, aspiring AI engineer.
- **The Core Architecture:** An agentic **Generate → Evaluate → Refine** loop governed by **8 binary pass/fail checkpoints** (no partial credit). Content is shipped *only* when all 8 checkpoints pass.

```
                  +--------------------------------+
                  |  Topic: "Introduction to RAG"  |
                  +---------------+----------------+
                                  |
                                  v
                    +-------------+-------------+
                    |    Draft Generator Agent   |
                    +-------------+-------------+
                                  |
                                  v
              +-------------------+-------------------+
              |                                       |
              v                                       v
    +---------+-----------+               +-----------+-----------+
    | Deterministic       |               | Semantic LLM Judge    |
    | Guardrails Engine   |               | 8-Checkpoint Hard     |
    | - Readability <= 8  |               | Pass/Fail Rubric      |
    | - Sentences <= 18w  |               | (Zero partial credit) |
    | - Jargon Scanner    |               +-----------+-----------+
    +---------+-----------+                           |
              |                                       |
              +-------------------+-------------------+
                                  |
                                  v
                            All 8 Passed?
                           /             \
                         NO               YES
                         /                 \
                        v                   v
              +---------+----------+  =====================
              | Surgical Refiner   |  APPROVED TO SHIP ✔
              | (Patches failing   |  =====================
              | checkpoints only)  |  - Shipped Markdown
              +---------+----------+  - Complete Audit JSON
                        |
                        +---> (Repeat Loop)
```

---

## 🎯 Target Persona Calibration (Indian 12th-Pass Profile)

| Dimension | Calibration Specification |
|---|---|
| **Education Level** | 12th Standard graduate (CBSE, ICSE, or State Board). |
| **Language Background** | Non-English medium or vernacular transition; limited English vocabulary (CEFR A2/B1). |
| **Cognitive Ceiling** | Sentences strictly capped at $\le 18$ words (average 9–13 words). Flesch-Kincaid Grade Level $\le 8.0$. |
| **Cultural Anchors** | Everyday Indian experiences: **The Open-Book vs Closed-Book Board Exam**, the school library catalog, Indian Railways (IRCTC) ticket rules. |
| **Jargon Rule** | **Zero Unexplained Jargon.** Any term like *LLM*, *Hallucination*, or *Vector DB* must be translated immediately into everyday words. |

---

## ⚖️ The 8-Checkpoint Hard Pass/Fail Rubric

No "7 out of 10" partial credit. A single failure halts deployment and triggers targeted remediation.

| Checkpoint ID | Dimension | Checkpoint Name | Hard Pass Criteria |
|---|---|---|---|
| **`CHK-101`** | **Accurate & Grounded** | Factual Accuracy | Accurately defines RAG as retrieval + generation; does not conflate with fine-tuning/retraining; mitigates hallucinations. |
| **`CHK-102`** | **Beginner Language** | Readability Ceiling | Flesch-Kincaid Grade Level $\le 8.0$; average sentence $\le 14$ words; sentences $>22$ words $\le 1$. |
| **`CHK-103`** | **Teaches by Example** | Cultural Analogy | Anchored in the **Open-Book vs Closed-Book Board Exam** analogy mapped explicitly to Retrieval, Augmentation, and Generation. |
| **`CHK-104`** | **No Jargon** | Zero Unexplained Jargon | Technical terms (*LLM*, *Hallucination*, *Vector DB*, *Prompt*) are immediately defined in plain English. No raw academic jargon (*cosine similarity*, *autoregressive*). |
| **`CHK-105`** | **Key Points** | Three-Pillar Curriculum | Explicitly covers all three required pillars: **What it is**, **Why it matters**, and **How it works**. |
| **`CHK-106`** | **Coherent Flow** | Pedagogical Ordering | Sequence: Hook/Problem $\to$ Core Analogy $\to$ Acronym Breakdown $\to$ How It Works Diagram $\to$ Indian Example $\to$ Quiz. |
| **`CHK-107`** | **Visual Scaffolding** | Formatting & Diagrams | Contains formatted callout tips (`> 💡`, `> ⚠️`) and an intuitive ASCII/Mermaid architecture flowchart. |
| **`CHK-108`** | **Active Learning** | Comprehension Quiz | Contains $\ge 2$ multiple-choice questions with explicit plain-English explanations for correct and incorrect options. |

*(For full formal specifications and failure examples, see [`docs/RUBRIC_FRAMEWORK.md`](docs/RUBRIC_FRAMEWORK.md))*

---

## 🚀 Quickstart: Run in 30 Seconds

### Prerequisites
- Node.js (v18+) or Python (3.10+) installed.
- **Zero API keys required for testing:** The engine includes a high-fidelity pedagogical simulation provider that mirrors the exact self-correction trajectory.
- *(Optional)* To run with live models, simply set `export GEMINI_API_KEY="your-key"` or `export OPENAI_API_KEY="your-key"`.

### 1. Run the Interactive CLI Loop
```bash
# Clone the repository
git clone https://github.com/your-username/rag-content-engine.git
cd rag-content-engine

# Run the autonomous evaluation loop
npm start
# or: node cli.js --topic "Introduction to RAG"
```

### 2. Launch the Interactive Web Dashboard
```bash
npm run web
# Open http://localhost:3000 in your browser
```

### 3. Run Automated Quality Tests
```bash
npm test
```

---

## 📊 Live Loop Execution Trajectory

Watch how the autonomous loop detects defects, rejects substandard content, and converges:

```
========================================================================
   GENAI CONTENT SYSTEMS — SELF-EVALUATING LESSON GENERATOR
   Target: 12th-Grade Graduate (India, Non-English Medium Transition)
========================================================================

📌 Input Topic: "Introduction to RAG"

------------------------------------------------------------------------
▶ ROUND 1 of 4 (Initial Draft)
------------------------------------------------------------------------
  [FAIL] ✖ CHK-101 — Factual Accuracy & Grounding
  [FAIL] ✖ CHK-102 — Beginner Language (Grade 12.3 exceeds 8.0 ceiling)
  [FAIL] ✖ CHK-103 — Cultural Analogy (Missing Open-Book Exam analogy)
  [FAIL] ✖ CHK-104 — Zero Unexplained Jargon (Detected: cosine similarity, dense embeddings)
  [PASS] ✔ CHK-105 — Three-Pillar Curriculum Coverage
  [FAIL] ✖ CHK-106 — Coherent Pedagogical Flow
  [FAIL] ✖ CHK-107 — Scaffolded Formatting & Diagrams
  [FAIL] ✖ CHK-108 — Active Learning Check
  Verdict: NEEDS_REVISION (1/8 Passed) ──> Sent to Surgical Refiner

------------------------------------------------------------------------
▶ ROUND 2 of 4 (Surgical Repair Round)
------------------------------------------------------------------------
  [PASS] ✔ CHK-101 — Factual Accuracy & Grounding
  [PASS] ✔ CHK-102 — Beginner Language (Grade 5.4, Avg Sentence 10.7w)
  [PASS] ✔ CHK-103 — Cultural Analogy (Open-Book Exam introduced)
  [PASS] ✔ CHK-104 — Zero Unexplained Jargon (Jargon translated to plain English)
  [FAIL] ✖ CHK-105 — Three-Pillar Curriculum (Missing 'Why it matters')
  [PASS] ✔ CHK-106 — Coherent Pedagogical Flow
  [FAIL] ✖ CHK-107 — Scaffolded Formatting (Missing ASCII diagram)
  [PASS] ✔ CHK-108 — Active Learning Check (Quiz added)
  Verdict: NEEDS_REVISION (6/8 Passed) ──> Sent to Surgical Refiner

------------------------------------------------------------------------
▶ ROUND 3 of 4 (Convergence & Final Approval)
------------------------------------------------------------------------
  [PASS] ✔ CHK-101 — Factual Accuracy & Grounding
  [PASS] ✔ CHK-102 — Beginner Language (Flesch-Kincaid Grade 4.5, Avg 9.3 words!)
  [PASS] ✔ CHK-103 — Cultural Analogy (Open-Book Exam mapped to R-A-G)
  [PASS] ✔ CHK-104 — Zero Unexplained Jargon (Zero ungrounded terms)
  [PASS] ✔ CHK-105 — Three-Pillar Curriculum (What, Why, How fully covered)
  [PASS] ✔ CHK-106 — Coherent Pedagogical Flow (Problem -> Analogy -> Pipeline -> Quiz)
  [PASS] ✔ CHK-107 — Scaffolded Formatting (ASCII diagram + tip callouts)
  [PASS] ✔ CHK-108 — Active Learning Check (3 questions with feedback)
  Verdict: APPROVED_TO_SHIP (8/8 Passed) ──> SHIPPED TO PRODUCTION ✔
```

---

## 📂 Repository Structure

```
rag-content-engine/
├── .github/workflows/
│   └── ci.yml                     # Automated GitHub Actions test pipeline
├── docs/
│   ├── SYSTEM_DESIGN.md           # In-depth architectural specification
│   ├── RUBRIC_FRAMEWORK.md        # The 8-checkpoint pass/fail rubric rationale
│   └── VIDEO_DEMO_SCRIPT.md       # Exact 5-minute video demonstration script
├── lessons/
│   ├── introduction_to_rag.md     # Shipped, perfected lesson artifact
│   └── audit_trail_introduction_to_rag.json  # Complete multi-round audit trace
├── node/                          # Production Runnable Engine & Web Console
│   ├── src/
│   │   ├── config.js              # Persona & rubric thresholds
│   │   ├── guardrails.js          # Deterministic readability & jargon regex
│   │   ├── evaluator.js           # 8-checkpoint pass/fail critic agent
│   │   ├── generator.js           # Drafting & surgical refiner agents
│   │   ├── orchestrator.js        # Loop controller & state machine
│   │   └── providers.js           # Gemini, OpenAI & Simulator providers
│   ├── web/                       # Live Web UI Dashboard
│   │   ├── server.js              # Native HTTP API server
│   │   └── public/                # Interactive Tailwind frontend
│   └── tests/                     # Unit test suite (100% passing)
├── python/                        # Full Python mirror implementation
│   ├── src/                       # Pydantic models, evaluator & orchestrator
│   ├── tests/                     # Pytest suite
│   ├── pyproject.toml
│   └── requirements.txt
├── cli.js                         # Terminal runner: `node cli.js`
├── package.json
└── README.md
```

---

## 🎥 Video Demonstration & Documentation

- **System Architecture Document:** Read the comprehensive technical breakdown in [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md).
- **Rubric Rationale & Calibration:** Explore the rubric design in [`docs/RUBRIC_FRAMEWORK.md`](docs/RUBRIC_FRAMEWORK.md).
- **Video Walkthrough Guide:** Step-by-step recording guide and talking script in [`docs/VIDEO_DEMO_SCRIPT.md`](docs/VIDEO_DEMO_SCRIPT.md).
- **Shipped Lesson Artifact:** Read the final lesson cleared by the system in [`lessons/introduction_to_rag.md`](lessons/introduction_to_rag.md).

---

## 💡 Key Engineering Takeaways for Hiring Committee

1. **Surgical Patching Over Blind Rewrites:** Naive LLM loops suffer from "Rubric Whack-a-Mole" (fixing one defect breaks another). Our refiner freezes passing nodes and executes surgical diffs.
2. **Deterministic First:** Programmatic readability metrics and regex guardrails run in $<5\text{ms}$ before any LLM critic is called, saving compute and latency.
3. **Auditable & Deterministic Verification:** Every run outputs a cryptographically reproducible JSON trace with line-level citations of failure reasons.

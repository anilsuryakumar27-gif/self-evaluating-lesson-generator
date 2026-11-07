/**
 * Configuration & Pedagogical Calibration Settings
 * Target Audience: 12th-grade graduate from India (non-English medium background, aspiring AI engineer)
 */

export const TARGET_PERSONA = {
  id: "india_12th_non_english_medium",
  title: "12th-Grade Graduate (India, Non-English Medium Transition)",
  educationLevel: "12th Standard (CBSE/ICSE/State Board)",
  languageProficiency: "CEFR A2/B1 (Conversational English, limited formal academic vocabulary)",
  readingGradeTarget: 8.0, // Flesch-Kincaid Grade Level threshold
  maxSentenceWords: 22,
  targetAverageSentenceWords: 14,
  culturalAnchors: [
    "Board Examinations (Open-Book vs Closed-Book)",
    "College Library & Catalog Register",
    "Kirana Store / Bahi-Khata (Accounting Ledger)",
    "Indian Railways (IRCTC) Ticket Reservation"
  ],
  monitoredJargon: [
    "LLM",
    "Large Language Model",
    "Hallucination",
    "Vector Database",
    "Vector DB",
    "Embeddings",
    "Prompt",
    "Context Window",
    "Cosine Similarity",
    "Autoregressive",
    "Stochastic",
    "Transformer"
  ]
};

export const RUBRIC_CHECKPOINTS = [
  {
    id: "CHK-101",
    name: "Factual Accuracy & Grounding",
    dimension: "Accurate & Grounded",
    type: "semantic",
    description: "RAG accurately defined (retrieval + generation). Does not conflate with fine-tuning. Accurately explains hallucination mitigation."
  },
  {
    id: "CHK-102",
    name: "Beginner Language & Readability",
    dimension: "Beginner-Friendly Language",
    type: "deterministic",
    description: "Flesch-Kincaid Grade Level <= 8.0, average sentence length <= 14 words, maximum sentence length <= 22 words."
  },
  {
    id: "CHK-103",
    name: "Teaches by Example (Cultural Analogy)",
    dimension: "Teaches by Example",
    type: "semantic",
    description: "Features a culturally grounded physical analogy (e.g. Open-Book Exam) explicitly mapped to Retrieval, Augmentation, and Generation."
  },
  {
    id: "CHK-104",
    name: "Zero Unexplained Jargon",
    dimension: "Clear, No Unexplained Jargon",
    type: "deterministic",
    description: "Every technical term (LLM, Hallucination, Vector DB, Prompt) must be translated into plain English before or at first use."
  },
  {
    id: "CHK-105",
    name: "Three-Pillar Curriculum Coverage",
    dimension: "Covers the Key Points",
    type: "semantic",
    description: "Explicitly covers What it is, Why it matters (hallucinations, fresh data, privacy), and How it works step-by-step."
  },
  {
    id: "CHK-106",
    name: "Coherent Pedagogical Flow",
    dimension: "Coherent Teaching Flow",
    type: "structural",
    description: "Structured scaffolded order: Hook -> Analogy -> Core Concept -> Flow Diagram -> Indian Example -> Career Value -> Quiz."
  },
  {
    id: "CHK-107",
    name: "Scaffolded Formatting & Diagrams",
    dimension: "Visual & Structural Clarity",
    type: "structural",
    description: "Contains visual callouts, bold key concepts, and an ASCII or Mermaid workflow diagram. No wall-of-text paragraphs (>80 words)."
  },
  {
    id: "CHK-108",
    name: "Active Learning Check (Quiz with Feedback)",
    dimension: "Active Learning",
    type: "semantic",
    description: "Includes at least 2 multiple-choice questions with explicit explanations for right and wrong options."
  }
];

export const SYSTEM_CONFIG = {
  maxIterations: 4,
  modelName: process.env.LLM_MODEL || "gemini-1.5-flash",
  simulatedMode: !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY,
  outputDir: "lessons",
  auditLogFile: "lessons/audit_trail_rag.json"
};

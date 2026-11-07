/**
 * Evaluator / Critic Agent
 * Executes the 8-Checkpoint Hard Pass/Fail Rubric.
 * No partial credit: every checkpoint strictly yields PASS (true) or FAIL (false).
 */

import { RUBRIC_CHECKPOINTS, TARGET_PERSONA } from './config.js';
import { calculateReadabilityMetrics, checkUnexplainedJargon, validateStructuralScaffolding } from './guardrails.js';

export class RubricEvaluator {
  constructor(options = {}) {
    this.options = options;
  }

  async evaluate(markdown, iterationIndex = 1) {
    const results = [];

    const readability = calculateReadabilityMetrics(markdown);
    const jargonCheck = checkUnexplainedJargon(markdown);
    const structure = validateStructuralScaffolding(markdown);

    // CHK-101: Factual Accuracy & Grounding
    results.push(this.evaluateAccuracy(markdown));

    // CHK-102: Beginner Language & Readability
    results.push(this.evaluateReadability(readability));

    // CHK-103: Teaches by Example (Cultural Analogy)
    results.push(this.evaluateAnalogy(markdown, structure));

    // CHK-104: Zero Unexplained Jargon
    results.push(this.evaluateJargon(jargonCheck));

    // CHK-105: Three-Pillar Curriculum Coverage
    results.push(this.evaluateThreePillars(markdown, structure));

    // CHK-106: Coherent Pedagogical Flow
    results.push(this.evaluateFlow(markdown));

    // CHK-107: Scaffolded Formatting & Diagrams
    results.push(this.evaluateFormatting(markdown, structure));

    // CHK-108: Active Learning Check (Quiz with Feedback)
    results.push(this.evaluateQuiz(markdown, structure));

    const allPassed = results.every(r => r.passed);
    const passedCount = results.filter(r => r.passed).length;

    return {
      iterationIndex,
      passed: allPassed,
      verdict: allPassed ? "APPROVED_TO_SHIP" : "NEEDS_REVISION",
      score: `${passedCount}/${RUBRIC_CHECKPOINTS.length}`,
      readabilityMetrics: {
        fleschKincaidGrade: readability.gradeLevel,
        avgSentenceLength: readability.avgWordsPerSentence,
        longSentenceCount: readability.longSentenceViolations.length
      },
      checkpoints: results,
      timestamp: new Date().toISOString()
    };
  }

  evaluateAccuracy(markdown) {
    const lower = markdown.toLowerCase();
    const definesRAG = lower.includes("retrieval-augmented generation") || lower.includes("retrieval augmented generation");
    const mentionsSearchAndGenerate = lower.includes("search") && (lower.includes("generate") || lower.includes("write"));
    const conflatesRetraining = lower.includes("retrains the neural network") || lower.includes("retrains the model every time");

    let passed = definesRAG && mentionsSearchAndGenerate && !conflatesRetraining;
    let reason = "RAG is accurately defined as external document retrieval combined with model generation.";
    let remediation = null;

    if (conflatesRetraining) {
      passed = false;
      reason = "Factual error: Content incorrectly states that RAG retrains the model on each query.";
      remediation = "Clarify that RAG does NOT retrain the model weights; it injects retrieved text into the prompt context.";
    } else if (!definesRAG) {
      passed = false;
      reason = "Missing formal definition of the RAG acronym.";
      remediation = "Explicitly define Retrieval-Augmented Generation letter by letter.";
    }

    return {
      id: "CHK-101",
      name: "Factual Accuracy & Grounding",
      dimension: "Accurate & Grounded",
      passed,
      reason,
      remediation
    };
  }

  evaluateReadability(readability) {
    const gradeOk = readability.gradeLevel <= TARGET_PERSONA.readingGradeTarget;
    const avgLenOk = readability.avgWordsPerSentence <= TARGET_PERSONA.targetAverageSentenceWords + 2;
    const maxViolationsOk = readability.longSentenceViolations.length <= 1;

    const passed = gradeOk && avgLenOk && maxViolationsOk;
    let reason = `Grade Level: ${readability.gradeLevel} (Target <= ${TARGET_PERSONA.readingGradeTarget}), Avg Sentence: ${readability.avgWordsPerSentence} words.`;
    let remediation = null;

    if (!passed) {
      const issues = [];
      if (!gradeOk) issues.push(`Flesch-Kincaid Grade Level is ${readability.gradeLevel} (exceeds 8.0 ceiling)`);
      if (!avgLenOk) issues.push(`Average sentence length is ${readability.avgWordsPerSentence} words (target <= 14)`);
      if (!maxViolationsOk) issues.push(`${readability.longSentenceViolations.length} sentences exceed 22 words`);

      reason = issues.join("; ");
      remediation = "Split compound sentences into punchy, short lines (<14 words). Use active voice and simple verbs.";
    }

    return {
      id: "CHK-102",
      name: "Beginner Language & Readability",
      dimension: "Beginner-Friendly Language",
      passed,
      reason,
      violations: readability.longSentenceViolations,
      remediation
    };
  }

  evaluateAnalogy(markdown, structure) {
    const hasOpenBook = /open-book/i.test(markdown);
    const connectsToRAG = /textbook|notes|exam/i.test(markdown) && /retriev|search/i.test(markdown);

    const passed = (hasOpenBook || structure.hasAnalogy) && connectsToRAG;
    let reason = "Features a relatable physical analogy (Open-Book Exam) clearly connected to RAG mechanics.";
    let remediation = null;

    if (!passed) {
      reason = "Missing or ungrounded core analogy for the Indian 12th-grade persona.";
      remediation = "Anchor the lesson in the Open-Book vs Closed-Book Exam analogy. Compare normal LLMs to closed-book exams and RAG to open-book exams.";
    }

    return {
      id: "CHK-103",
      name: "Teaches by Example (Cultural Analogy)",
      dimension: "Teaches by Example",
      passed,
      reason,
      remediation
    };
  }

  evaluateJargon(jargonCheck) {
    const passed = jargonCheck.passed;
    let reason = "Zero unexplained technical jargon detected.";
    let remediation = null;

    if (!passed) {
      const terms = jargonCheck.violations.map(v => v.term).join(", ");
      reason = `Detected ungrounded or overly complex jargon: ${terms}.`;
      remediation = `For each flagged term (${terms}), either replace with simple words or immediately follow with a plain-English translation (e.g. 'Vector DB — like a smart digital bookshelf').`;
    }

    return {
      id: "CHK-104",
      name: "Zero Unexplained Jargon",
      dimension: "Clear, No Unexplained Jargon",
      passed,
      reason,
      violations: jargonCheck.violations,
      remediation
    };
  }

  evaluateThreePillars(markdown, structure) {
    const lower = markdown.toLowerCase();
    const coversWhat = lower.includes("what is rag") || lower.includes("what rag is");
    const coversWhy = lower.includes("why") && (lower.includes("matters") || lower.includes("need") || lower.includes("hallucination"));
    const coversHow = lower.includes("how") && (lower.includes("works") || lower.includes("steps") || lower.includes("step-by-step"));

    const passed = coversWhat && coversWhy && coversHow;
    let reason = "Covers all three required foundational pillars: What it is, Why it matters, and How it works.";
    let remediation = null;

    if (!passed) {
      const missing = [];
      if (!coversWhat) missing.push("'What it is'");
      if (!coversWhy) missing.push("'Why it matters'");
      if (!coversHow) missing.push("'How it works'");
      reason = `Missing required curriculum pillars: ${missing.join(", ")}.`;
      remediation = `Add dedicated sections explicitly titled for the missing pillars: ${missing.join(", ")}.`;
    }

    return {
      id: "CHK-105",
      name: "Three-Pillar Curriculum Coverage",
      dimension: "Covers the Key Points",
      passed,
      reason,
      remediation
    };
  }

  evaluateFlow(markdown) {
    // Look at main section headers for pedagogical ordering
    const headers = markdown.split(/\r?\n/).filter(line => /^##+\s+/.test(line));
    const headerText = headers.join('\n');

    const hookIndex = headerText.search(/problem|imagine|smart|need/i);
    const analogyIndex = headerText.search(/analogy|open-book|exam/i);
    const howIndex = headerText.search(/how\s+(rag\s+works|it\s+works)/i);
    const quizIndex = headerText.search(/quiz|self-check|questions/i);

    let ordered = false;
    if (hookIndex !== -1 && analogyIndex !== -1 && howIndex !== -1 && quizIndex !== -1) {
      ordered = hookIndex < analogyIndex && analogyIndex < howIndex && howIndex < quizIndex;
    } else {
      // Fallback: check document body order ignoring the first 300 characters (table of contents)
      const body = markdown.slice(300);
      const bHook = body.search(/part\s*1|problem/i);
      const bAnalogy = body.search(/part\s*2|open-book/i);
      const bHow = body.search(/part\s*4|how.*works/i);
      const bQuiz = body.search(/part\s*7|quiz|self-check/i);
      ordered = bHook !== -1 && bAnalogy !== -1 && bHow !== -1 && bQuiz !== -1 &&
                bHook < bAnalogy && bAnalogy < bHow && bHow < bQuiz;
    }

    const passed = ordered;
    let reason = "Pedagogical flow follows proven scaffolding: Problem -> Analogy -> Architecture -> Quiz.";
    let remediation = null;

    if (!passed) {
      reason = "Pedagogical ordering is disjointed or out of sequence.";
      remediation = "Restructure the lesson into the standard sequence: Problem/Hook -> Core Analogy -> Component Breakdown -> How It Works Diagram -> Indian Example -> Quiz.";
    }

    return {
      id: "CHK-106",
      name: "Coherent Pedagogical Flow",
      dimension: "Coherent Teaching Flow",
      passed,
      reason,
      remediation
    };
  }

  evaluateFormatting(markdown, structure) {
    const hasDiagram = structure.hasDiagram;
    const hasCallouts = markdown.includes("> 💡") || markdown.includes("> ⚠️") || markdown.includes(">");
    const hasTablesOrLists = markdown.includes("|") || markdown.includes("- [ ]") || markdown.includes("* ");

    const passed = hasDiagram && hasCallouts && hasTablesOrLists;
    let reason = "Rich formatting: visual ASCII/Mermaid diagram, tip callouts, bold key phrases.";
    let remediation = null;

    if (!passed) {
      const missing = [];
      if (!hasDiagram) missing.push("visual architecture flowchart");
      if (!hasCallouts) missing.push("tip/warning callout blocks");
      reason = `Formatting lacks visual scaffolding: missing ${missing.join(", ")}.`;
      remediation = "Include an intuitive ASCII/Mermaid diagram illustrating the 3-step pipeline (Question -> Retrieve -> Augment -> Generate).";
    }

    return {
      id: "CHK-107",
      name: "Scaffolded Formatting & Diagrams",
      dimension: "Visual & Structural Clarity",
      passed,
      reason,
      remediation
    };
  }

  evaluateQuiz(markdown, structure) {
    const hasQuiz = structure.hasQuiz;
    const hasExplanations = /explanation|option.*correct|because/i.test(markdown);

    const passed = hasQuiz && hasExplanations;
    let reason = "Active learning verified: includes interactive self-check questions with explanations.";
    let remediation = null;

    if (!passed) {
      reason = "Missing interactive self-check quiz or lacks explanation for correct/incorrect choices.";
      remediation = "Add 2-3 multiple-choice self-check questions at the end, providing clear explanations for why each option is right or wrong.";
    }

    return {
      id: "CHK-108",
      name: "Active Learning Check (Quiz with Feedback)",
      dimension: "Active Learning",
      passed,
      reason,
      remediation
    };
  }
}

/**
 * Deterministic Guardrails Engine
 * High-speed, rule-based algorithmic checks that run in <5ms.
 * Enforces hard mathematical bounds on readability, sentence length, and unexplained jargon.
 */

import { TARGET_PERSONA } from './config.js';

/**
 * Counts syllables in an English word using phonetic heuristics.
 */
export function countSyllables(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;

  // Words ending in consonant + le (e.g. sim-ple, bot-tle, ta-ble)
  let leSyllable = 0;
  let working = clean;
  if (/[^aeiou]le$/.test(clean)) {
    leSyllable = 1;
    working = clean.slice(0, -2);
  } else {
    working = clean.replace(/(?:ed|es|e)$/, '');
  }

  working = working.replace(/^y/, '');
  const matches = working.match(/[aeiouy]{1,2}/g);
  const total = (matches ? matches.length : 0) + leSyllable;
  return Math.max(1, total);
}

/**
 * Splits markdown text into clean sentences, properly handling markdown structure.
 */
export function extractSentences(markdown) {
  // Strip code blocks, tables, and headers
  let cleaned = markdown.replace(/```[\s\S]*?```/g, '')
                        .replace(/\|.*\|/g, '')
                        .replace(/^#+.*$/gm, '')
                        .replace(/!\[.*?\]\(.*?\)/g, '')
                        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                        .replace(/^\s*>\s*/gm, '') // Strip blockquotes
                        .replace(/^\s*[-*+]\s+/gm, '') // Strip bullet points
                        .replace(/^\s*\d+\.\s+/gm, '') // Strip numbered lists
                        .replace(/^\s*\*\*[^*]+:\*\*\s*/gm, ''); // Strip bold prefix labels like **User asks:**

  // Split on newlines first, then sentence terminators (. ! ?)
  const lines = cleaned.split(/\r?\n+/);
  const rawSentences = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---')) continue;
    
    // Split line on sentence endings
    const segments = trimmed.split(/(?<=[.!?])\s+/);
    for (const seg of segments) {
      const s = seg.trim().replace(/^\W+/, '').replace(/\W+$/, '');
      if (s.length > 5 && /[a-zA-Z]/.test(s)) {
        rawSentences.push(s);
      }
    }
  }

  return rawSentences;
}

/**
 * Computes Flesch-Kincaid Grade Level and sentence statistics.
 */
export function calculateReadabilityMetrics(markdown) {
  const sentences = extractSentences(markdown);
  if (sentences.length === 0) {
    return { gradeLevel: 0, avgWordsPerSentence: 0, maxWords: 0, violations: [] };
  }

  let totalWords = 0;
  let totalSyllables = 0;
  const longSentenceViolations = [];

  sentences.forEach((s, idx) => {
    const words = s.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    totalWords += wordCount;

    if (wordCount > TARGET_PERSONA.maxSentenceWords) {
      longSentenceViolations.push({
        sentenceIndex: idx + 1,
        wordCount,
        snippet: s.length > 70 ? s.slice(0, 67) + '...' : s
      });
    }

    words.forEach(w => {
      totalSyllables += countSyllables(w);
    });
  });

  const avgWordsPerSentence = totalWords / sentences.length;
  const avgSyllablesPerWord = totalWords > 0 ? totalSyllables / totalWords : 1;
  const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  return {
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    totalSentences: sentences.length,
    totalWords,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    longSentenceViolations
  };
}

/**
 * Checks for unexplained jargon terms.
 */
export function checkUnexplainedJargon(markdown) {
  const forbiddenUnexplainedPatterns = [
    { term: "cosine similarity", pattern: /cosine\s+similarity/i },
    { term: "autoregressive", pattern: /autoregressive/i },
    { term: "stochastic", pattern: /stochastic/i },
    { term: "latent space", pattern: /latent\s+space/i },
    { term: "dense embeddings", pattern: /dense\s+embeddings/i }
  ];

  const monitoredTerms = [
    { term: "LLM", pattern: /\bLLM\b|\bLarge Language Model\b/i },
    { term: "Hallucination", pattern: /\bhallucination\b|\bhallucinating\b/i },
    { term: "Vector Database", pattern: /\bvector\s+database\b|\bvector\s+db\b/i },
    { term: "Prompt", pattern: /\bprompt\b/i }
  ];

  const violations = [];

  for (const item of forbiddenUnexplainedPatterns) {
    if (item.pattern.test(markdown)) {
      violations.push({
        term: item.term,
        reason: `Term '${item.term}' is too advanced for a 12th-grade beginner. Replace with simple English or an analogy.`
      });
    }
  }

  const lower = markdown.toLowerCase();
  for (const item of monitoredTerms) {
    if (item.pattern.test(markdown)) {
      const hasExplanation = 
        lower.includes("like a") || 
        lower.includes("think of") || 
        lower.includes("means") || 
        lower.includes("program trained") || 
        lower.includes("smart digital bookshelf") || 
        lower.includes("instruction") || 
        lower.includes("fake facts") || 
        lower.includes("makes up");

      if (!hasExplanation) {
        violations.push({
          term: item.term,
          reason: `Term '${item.term}' was introduced without a nearby plain-English explanation or analogy.`
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

/**
 * Validates structural scaffolding requirements.
 */
export function validateStructuralScaffolding(markdown) {
  const hasAsciiDiagram = markdown.includes("┌") || markdown.includes("+--") || (markdown.includes("|") && markdown.includes("-->"));
  const hasMermaidDiagram = markdown.includes("```mermaid");
  const hasDiagram = hasAsciiDiagram || hasMermaidDiagram;

  const hasQuiz = /question\s+[1-3]|quick.*quiz|self-check/i.test(markdown) &&
                  /\[\s*x?\s*\]|\([A-D]\)/i.test(markdown);

  const hasAnalogy = /open-book|closed-book|exam|textbook|library/i.test(markdown);

  const hasThreePillars = 
    /what\s+is\s+rag/i.test(markdown) &&
    /why\s+(it\s+matters|we\s+need|rag)/i.test(markdown) &&
    /how\s+(it\s+works|rag\s+works)/i.test(markdown);

  return {
    hasDiagram,
    hasQuiz,
    hasAnalogy,
    hasThreePillars
  };
}

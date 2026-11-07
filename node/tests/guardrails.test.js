import test from 'node:test';
import assert from 'node:assert';
import { countSyllables, calculateReadabilityMetrics, checkUnexplainedJargon, validateStructuralScaffolding } from '../src/guardrails.js';

test('countSyllables accurately counts phonetic syllables', () => {
  assert.strictEqual(countSyllables('cat'), 1);
  assert.strictEqual(countSyllables('simple'), 2);
  assert.strictEqual(countSyllables('generation'), 4);
  assert.strictEqual(countSyllables('retrieval'), 3);
});

test('calculateReadabilityMetrics computes accurate Flesch-Kincaid Grade Level', () => {
  const simpleText = 'This is an open book. You read the page. The answer is clear and true.';
  const metrics = calculateReadabilityMetrics(simpleText);
  assert.ok(metrics.gradeLevel <= 6.0, `Expected grade <= 6.0, got ${metrics.gradeLevel}`);
  assert.strictEqual(metrics.longSentenceViolations.length, 0);
});

test('checkUnexplainedJargon flags forbidden academic jargon', () => {
  const badDraft = 'We use cosine similarity and autoregressive dense embeddings.';
  const result = checkUnexplainedJargon(badDraft);
  assert.strictEqual(result.passed, false);
  assert.ok(result.violations.length >= 2);
});

test('validateStructuralScaffolding recognizes ASCII diagram and quiz', () => {
  const content = `
\`\`\`
+----------------+
|  ASCII DIAGRAM |
+----------------+
\`\`\`
### Quick Quiz
1. What is RAG?
- [ ] A) Testing
`;
  const scaffolding = validateStructuralScaffolding(content);
  assert.strictEqual(scaffolding.hasDiagram, true);
  assert.strictEqual(scaffolding.hasQuiz, true);
});

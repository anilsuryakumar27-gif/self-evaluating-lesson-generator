import test from 'node:test';
import assert from 'node:assert';
import { RubricEvaluator } from '../src/evaluator.js';

test('RubricEvaluator catches all defects in raw junior draft', async () => {
  const evaluator = new RubricEvaluator();
  const rawDraft = `
# RAG
RAG is Retrieval Augmented Generation using dense embeddings and cosine similarity.
It retrains the neural network on every user prompt.
`;
  const report = await evaluator.evaluate(rawDraft);
  assert.strictEqual(report.passed, false);
  assert.strictEqual(report.verdict, 'NEEDS_REVISION');
  
  // Accuracy check must fail due to retraining claim
  const chk101 = report.checkpoints.find(c => c.id === 'CHK-101');
  assert.strictEqual(chk101.passed, false);

  // Jargon check must fail due to cosine similarity
  const chk104 = report.checkpoints.find(c => c.id === 'CHK-104');
  assert.strictEqual(chk104.passed, false);
});

test('RubricEvaluator passes perfected lesson across all 8 checkpoints', async () => {
  const evaluator = new RubricEvaluator();
  const fs = await import('fs');
  const path = await import('path');
  const lessonPath = path.resolve('lessons', 'introduction_to_rag.md');
  const perfectedLesson = fs.readFileSync(lessonPath, 'utf8');

  const report = await evaluator.evaluate(perfectedLesson);
  assert.strictEqual(report.passed, true);
  assert.strictEqual(report.verdict, 'APPROVED_TO_SHIP');
  assert.strictEqual(report.score, '8/8');
});

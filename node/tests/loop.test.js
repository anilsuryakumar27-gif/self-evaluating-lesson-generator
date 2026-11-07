import test from 'node:test';
import assert from 'node:assert';
import { ContentLoopOrchestrator } from '../src/orchestrator.js';

test('ContentLoopOrchestrator converges and approves lesson within 3 iterations', async () => {
  const orchestrator = new ContentLoopOrchestrator({ maxIterations: 4 });
  const result = await orchestrator.runLoop('Introduction to RAG');

  assert.strictEqual(result.status, 'APPROVED_TO_SHIP');
  assert.ok(result.iterationsCount <= 3);
  assert.strictEqual(result.finalEvaluation.score, '8/8');
  assert.strictEqual(result.finalEvaluation.passed, true);
});

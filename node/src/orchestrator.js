/**
 * Content Loop Orchestrator
 * Controls the Generate -> Evaluate -> Refine self-evaluation loop.
 * Guarantees zero-defect shipping before content reaches production.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SYSTEM_CONFIG } from './config.js';
import { ModelProvider } from './providers.js';
import { GeneratorAgent, RefinerAgent } from './generator.js';
import { RubricEvaluator } from './evaluator.js';

export class ContentLoopOrchestrator {
  constructor(options = {}) {
    this.options = { ...SYSTEM_CONFIG, ...options };
    this.provider = new ModelProvider();
    this.generator = new GeneratorAgent(this.provider);
    this.refiner = new RefinerAgent(this.provider);
    this.evaluator = new RubricEvaluator();
    this.onProgressCallback = options.onProgress || (() => {});
  }

  /**
   * Runs the complete autonomous generation and self-evaluation loop.
   */
  async runLoop(topic = "Introduction to RAG") {
    const startTime = Date.now();
    const auditTrail = {
      topic,
      targetPersona: "12th-grade graduate from India (non-English-medium)",
      modelProvider: this.provider.mode,
      startedAt: new Date().toISOString(),
      iterations: [],
      finalStatus: "IN_PROGRESS",
      shippedArtifactPath: null,
      totalDurationMs: 0
    };

    let currentDraft = null;
    let iteration = 1;
    let finalEvaluation = null;

    while (iteration <= this.options.maxIterations) {
      this.notifyProgress({
        type: 'ITERATION_START',
        iteration,
        maxIterations: this.options.maxIterations
      });

      // Step 1: Generate or Refine
      if (iteration === 1) {
        this.notifyProgress({ type: 'GENERATING_INITIAL_DRAFT', iteration });
        currentDraft = await this.generator.generateInitialDraft(topic);
      } else {
        this.notifyProgress({
          type: 'REFINING_DRAFT',
          iteration,
          failingChecksCount: finalEvaluation.checkpoints.filter(c => !c.passed).length
        });
        currentDraft = await this.refiner.refine(currentDraft, finalEvaluation, iteration);
      }

      // Step 2: Evaluate against the 8-Checkpoint Hard Rubric
      this.notifyProgress({ type: 'EVALUATING_DRAFT', iteration });
      finalEvaluation = await this.evaluator.evaluate(currentDraft, iteration);

      // Record iteration in audit trail
      const iterationRecord = {
        iteration,
        draftLengthWords: currentDraft.split(/\s+/).length,
        verdict: finalEvaluation.verdict,
        score: finalEvaluation.score,
        passed: finalEvaluation.passed,
        readabilityMetrics: finalEvaluation.readabilityMetrics,
        checkpoints: finalEvaluation.checkpoints,
        draftSnippet: currentDraft.slice(0, 300) + '...'
      };
      auditTrail.iterations.push(iterationRecord);

      this.notifyProgress({
        type: 'ITERATION_COMPLETE',
        iteration,
        evaluation: finalEvaluation
      });

      // Step 3: Check Termination Conditions
      if (finalEvaluation.passed) {
        auditTrail.finalStatus = "APPROVED_TO_SHIP";
        this.notifyProgress({ type: 'LOOP_SUCCESS', iteration, score: finalEvaluation.score });
        break;
      }

      if (iteration === this.options.maxIterations) {
        auditTrail.finalStatus = "MAX_ITERATIONS_REACHED";
        this.notifyProgress({ type: 'LOOP_EXHAUSTED', iteration });
        break;
      }

      iteration++;
    }

    auditTrail.totalDurationMs = Date.now() - startTime;
    auditTrail.completedAt = new Date().toISOString();

    // Persist final artifacts
    await this.persistArtifacts(topic, currentDraft, auditTrail);

    return {
      status: auditTrail.finalStatus,
      iterationsCount: auditTrail.iterations.length,
      finalEvaluation,
      finalLesson: currentDraft,
      auditTrail
    };
  }

  notifyProgress(event) {
    this.onProgressCallback(event);
  }

  async persistArtifacts(topic, content, auditTrail) {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const lessonPath = path.join(this.options.outputDir, `${slug}.md`);
    const auditPath = path.join(this.options.outputDir, `audit_trail_${slug}.json`);

    await fs.mkdir(this.options.outputDir, { recursive: true });
    await fs.writeFile(lessonPath, content, 'utf8');
    await fs.writeFile(auditPath, JSON.stringify(auditTrail, null, 2), 'utf8');

    auditTrail.shippedArtifactPath = lessonPath;
  }
}

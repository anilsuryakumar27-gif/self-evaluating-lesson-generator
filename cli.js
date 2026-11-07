#!/usr/bin/env node
/**
 * Interactive Terminal CLI Runner
 * Demonstrates the autonomous Generate -> Evaluate -> Refine agentic loop.
 */

import { ContentLoopOrchestrator } from './node/src/orchestrator.js';

// Simple ANSI color helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

function banner() {
  console.log(`\n${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   GENAI CONTENT SYSTEMS — SELF-EVALUATING LESSON GENERATOR${colors.reset}`);
  console.log(`${colors.dim}   Target: 12th-Grade Graduate (India, Non-English Medium Transition)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}\n`);
}

async function main() {
  banner();

  // Parse CLI args
  const args = process.argv.slice(2);
  let topic = "Introduction to RAG";
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--topic' || args[i] === '-t') && args[i + 1]) {
      topic = args[i + 1];
    }
  }

  console.log(`${colors.bold}📌 Input Topic:${colors.reset} "${topic}"`);
  console.log(`${colors.dim}Starting autonomous generation & rubric evaluation loop...\n${colors.reset}`);

  const orchestrator = new ContentLoopOrchestrator({
    onProgress: (event) => {
      handleProgressEvent(event);
    }
  });

  const result = await orchestrator.runLoop(topic);

  printSummary(result);
}

function handleProgressEvent(event) {
  switch (event.type) {
    case 'ITERATION_START':
      console.log(`${colors.bold}${colors.blue}------------------------------------------------------------------------${colors.reset}`);
      console.log(`${colors.bold}${colors.blue}▶ ROUND ${event.iteration} of ${event.maxIterations}${colors.reset}`);
      console.log(`${colors.bold}${colors.blue}------------------------------------------------------------------------${colors.reset}`);
      break;

    case 'GENERATING_INITIAL_DRAFT':
      console.log(`${colors.cyan}⚙ Generating initial draft with target persona constraints...${colors.reset}`);
      break;

    case 'REFINING_DRAFT':
      console.log(`${colors.yellow}🔧 Surgical Refiner active: repairing ${event.failingChecksCount} failing checkpoint(s)...${colors.reset}`);
      break;

    case 'EVALUATING_DRAFT':
      console.log(`${colors.cyan}⚖ Evaluating draft against the 8-Checkpoint Hard Pass/Fail Rubric...${colors.reset}\n`);
      break;

    case 'ITERATION_COMPLETE':
      printScorecard(event.iteration, event.evaluation);
      break;

    case 'LOOP_SUCCESS':
      console.log(`\n${colors.bold}${colors.green}✔ SUCCESS: All ${event.score} checkpoints passed! Content clears the bar.${colors.reset}`);
      break;

    case 'LOOP_EXHAUSTED':
      console.log(`\n${colors.bold}${colors.red}✖ HALTED: Maximum iterations reached without clearing all checkpoints.${colors.reset}`);
      break;
  }
}

function printScorecard(iteration, evaluation) {
  console.log(`${colors.bold}📊 Round ${iteration} Quality Scorecard (${evaluation.score} Passed):${colors.reset}`);
  
  evaluation.checkpoints.forEach(chk => {
    const symbol = chk.passed ? `${colors.green}[PASS] ✔${colors.reset}` : `${colors.red}[FAIL] ✖${colors.reset}`;
    console.log(`  ${symbol} ${colors.bold}${chk.id}${colors.reset} — ${chk.name}`);
    console.log(`     ${colors.dim}Reason: ${chk.reason}${colors.reset}`);
    if (!chk.passed && chk.remediation) {
      console.log(`     ${colors.yellow}↳ Fix: ${chk.remediation}${colors.reset}`);
    }
  });

  console.log(`\n  ${colors.dim}Readability Metrics: Flesch-Kincaid Grade ${evaluation.readabilityMetrics.fleschKincaidGrade} (Ceiling: 8.0) | Avg Sentence: ${evaluation.readabilityMetrics.avgSentenceLength} words${colors.reset}\n`);
  
  if (!evaluation.passed) {
    console.log(`  ${colors.red}${colors.bold}Verdict: ${evaluation.verdict} (Content cannot be shipped yet)${colors.reset}\n`);
  } else {
    console.log(`  ${colors.green}${colors.bold}Verdict: ${evaluation.verdict} (APPROVED FOR PUBLICATION)${colors.reset}\n`);
  }
}

function printSummary(result) {
  console.log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}🏁 EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`Final Status:     ${result.status === 'APPROVED_TO_SHIP' ? colors.green + result.status + colors.reset : colors.red + result.status + colors.reset}`);
  console.log(`Iterations Run:   ${result.iterationsCount}`);
  console.log(`Final Rubric:     ${result.finalEvaluation.score} Checkpoints Cleared`);
  console.log(`Shipped Lesson:   ${colors.cyan}${result.auditTrail.shippedArtifactPath}${colors.reset}`);
  console.log(`Audit Trail Log:  ${colors.cyan}lessons/audit_trail_introduction_to_rag.json${colors.reset}`);
  console.log(`Total Duration:   ${result.auditTrail.totalDurationMs} ms\n`);
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});

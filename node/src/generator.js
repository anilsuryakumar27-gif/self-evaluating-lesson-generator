/**
 * Generator & Refiner Agent Modules
 * Produces initial drafts and executes surgical repairs targeting failing rubric checkpoints.
 */

import { TARGET_PERSONA, RUBRIC_CHECKPOINTS } from './config.js';

export class GeneratorAgent {
  constructor(provider) {
    this.provider = provider;
  }

  buildDraftingPrompt(topic) {
    return `You are an expert GenAI Curriculum Architect.
Write an introductory beginner lesson on the topic: "${topic}".

TARGET LEARNER PERSONA:
- Profile: ${TARGET_PERSONA.title}
- Background: Completed 12th standard in India, non-English-medium background.
- Language Constraints: CEFR A2/B1 level. Use simple, everyday conversational English.
- Sentence Length: MAXIMUM 18 words per sentence. Average 12 words per sentence.
- Zero Unexplained Jargon: If you mention any technical term (LLM, Hallucination, Vector Database, Prompt), explain it in plain words immediately.
- Cultural Anchor: Use the "Open-Book vs Closed-Book Board Exam" analogy to explain the concept.

CURRICULUM REQUIREMENTS:
1. Part 1: The Problem — Why AI makes confident mistakes (Hallucination).
2. Part 2: The Core Analogy — The Open-Book Exam comparison.
3. Part 3: What is ${topic}? (Break down the letters).
4. Part 4: How it works step-by-step with an ASCII flowchart.
5. Part 5: Concrete Real-World Example (e.g. Indian Railways IRCTC ticket rules).
6. Part 6: Why this matters for the learner's AI career in India.
7. Part 7: Quick 3-Question Self-Check with explanations for each option.
8. Part 8: 1-Minute Cheat Sheet Summary Table.

Output only clean, formatted Markdown.`;
  }

  async generateInitialDraft(topic) {
    const prompt = this.buildDraftingPrompt(topic);
    const system = `You are a world-class educational AI content engineer. You write crystal-clear, highly engaging lessons for second-language learners.`;
    return await this.provider.generate(prompt, system, 1);
  }
}

export class RefinerAgent {
  constructor(provider) {
    this.provider = provider;
  }

  buildRefinementPrompt(previousDraft, evaluationReport) {
    const failingChecks = evaluationReport.checkpoints.filter(c => !c.passed);
    const issuesList = failingChecks.map(c => `
- CHECKPOINT [${c.id}] ${c.name}:
  * Failure Reason: ${c.reason}
  * Remediation Guidance: ${c.remediation}
`).join('\n');

    return `You are an autonomous AI Content Refiner.
The previous draft of the lesson failed our strict Quality Rubric.

=== PREVIOUS DRAFT ===
${previousDraft}

=== CRITIC EVALUATION & FAILING CHECKPOINTS ===
The draft failed ${failingChecks.length} checkpoints:
${issuesList}

=== SURGICAL REPAIR INSTRUCTIONS ===
1. Keep all sections that are already passing intact to prevent regression.
2. Directly address the failing checkpoints above:
   - Break any long compound sentences into punchy, short lines (<14 words).
   - Ensure every technical term (LLM, Hallucination, Vector DB, Prompt) is paired with an immediate plain-English translation.
   - Include the Open-Book vs Closed-Book Board Exam analogy.
   - Ensure the ASCII architecture flowchart and quiz explanations are present.
3. Output the complete revised lesson in Markdown.`;
  }

  async refine(previousDraft, evaluationReport, iterationIndex) {
    const prompt = this.buildRefinementPrompt(previousDraft, evaluationReport);
    const system = `You are a surgical pedagogical refiner. You fix exact rubric defects without degrading existing content.`;
    return await this.provider.generate(prompt, system, iterationIndex);
  }
}

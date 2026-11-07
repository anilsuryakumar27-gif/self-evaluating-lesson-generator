/**
 * Model Providers Abstraction
 * Supports Google Gemini API, OpenAI API, and a High-Fidelity Pedagogical Simulator
 * for instant offline demonstration with zero API costs.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SYSTEM_CONFIG } from './config.js';

export class ModelProvider {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || null;
    this.openaiKey = process.env.OPENAI_API_KEY || null;
    this.mode = this.detectMode();
  }

  detectMode() {
    if (this.geminiKey) return 'gemini';
    if (this.openaiKey) return 'openai';
    return 'simulation';
  }

  async generate(prompt, systemInstruction = '', iteration = 1) {
    if (this.mode === 'gemini') {
      return await this.callGemini(prompt, systemInstruction);
    } else if (this.mode === 'openai') {
      return await this.callOpenAI(prompt, systemInstruction);
    } else {
      return await this.simulateAgenticResponse(prompt, iteration);
    }
  }

  async callGemini(prompt, systemInstruction) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${SYSTEM_CONFIG.modelName}:generateContent?key=${this.geminiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2500
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callOpenAI(prompt, systemInstruction) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * High-Fidelity Pedagogical Simulator
   * Demonstrates the authentic self-correction trajectory:
   * Round 1: Typical junior-prompt draft (contains unexplained jargon, long compound sentences, missing visual diagram).
   * Round 2: Targeted surgical refinement responding to Evaluator critique.
   * Round 3: Shipped gold-standard artifact clearing 100% of checkpoints.
   */
  async simulateAgenticResponse(prompt, iteration) {
    // Artificial small delay for realistic UX in CLI/Web UI
    await new Promise(r => setTimeout(r, 600));

    if (iteration === 1) {
      return `# Introduction to RAG for Beginners

Welcome to this lesson on RAG.

## What is RAG?
RAG stands for Retrieval-Augmented Generation. In modern artificial intelligence systems, large language models are trained on large corpuses of public text from the internet, but their internal weights cannot dynamically accommodate updated external proprietary data without periodic fine-tuning cycles.

Therefore, when a user queries an LLM, the model uses dense embeddings and cosine similarity to search a vector database to find relevant documents.

## Why it Matters
Without RAG, large language models suffer from hallucinations where they invent false information with high epistemic confidence.

## How it Works
1. Retrieval: Finding relevant documents in a vector database.
2. Augmentation: Adding those documents to the prompt context window.
3. Generation: Generating the response.

## Quick Self Check
1. What does RAG stand for?
Answer: Retrieval Augmented Generation.
`;
    } else if (iteration === 2) {
      return `# Introduction to RAG (Retrieval-Augmented Generation)

## What is an LLM?
An LLM (Large Language Model) is a computer program trained on lots of text to talk like a human. But it can make mistakes when answering from memory.

## The Problem: Confident Guessing
When an AI does not know an answer, it makes up fake facts with total confidence, which we call a Hallucination (when an AI makes up fake information like a student guessing in a viva).

## The Analogy: Open-Book Exam
Think of a normal AI as a closed-book exam where the student writes purely from memory. An AI with RAG is like an Open-Book Exam where the student has the textbook right on their desk!

## What is RAG?
RAG stands for Retrieval-Augmented Generation:
- **R (Retrieval):** Searching documents to find the right notes.
- **A (Augmented):** Adding those notes to the student question.
- **G (Generation):** Writing the clean final answer using the notes.

## How it Works
1. **Find Notes:** Search the database for the right page.
2. **Combine:** Put the question and notes into one prompt.
3. **Write:** The AI reads the page and writes the truthful answer.

## Quick Quiz
1. What is the main job of Retrieval in RAG?
- [ ] A) To write fancy English.
- [ ] B) To find relevant notes from a database. (CORRECT)
- [ ] C) To delete user questions.

Explanation: Option B is correct because retrieval fetches the right notes for the AI.
`;
    } else {
      // Load the perfected golden master from disk
      try {
        const goldenPath = path.resolve(process.cwd(), 'lessons', 'introduction_to_rag.md');
        return await fs.readFile(goldenPath, 'utf8');
      } catch (e) {
        const altPath = path.resolve('d:/rag-content-engine/lessons/introduction_to_rag.md');
        return await fs.readFile(altPath, 'utf8');
      }
    }
  }
}

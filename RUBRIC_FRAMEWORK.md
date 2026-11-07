# Rubric Framework: Hard Pass/Fail Quality Checkpoints
**Project:** Self-Evaluating Lesson Content Generator  
**Philosophy:** Binary Quality Gates — Zero Partial Credit — No Shipped Defects

---

## 1. Rubric Design Philosophy

Traditional content grading systems often assign subjective scores (e.g., "7/10 for clarity"). In automated content publishing systems, subjective numbers fail because:
1. A lesson scoring "8/10" might still contain an unexplained, intimidating jargon term that completely blocks a 12th-grade beginner.
2. Numerical scores mask regression: an edit that raises an analogy score from 7 to 9 might simultaneously introduce technical inaccuracies.

Our framework uses **Deterministic and Semantic Binary Gates (`PASS` / `FAIL`)**. 
- A draft passes if and only if **100% of checkpoints pass**.
- A single failure returns the draft to the loop with targeted diagnostic feedback.

---

## 2. Checkpoint Specifications

### `CHK-101`: Factual Accuracy & Grounding
- **Dimension:** Accurate & Grounded
- **Target Concept:** Retrieval-Augmented Generation (RAG)
- **Evaluation Method:** LLM Judge + Semantic Fact Extraction
- **Pass Criteria:**
  - Accurately states that RAG pairs an information retrieval step with a generative language model.
  - Correctly notes that RAG does NOT require retraining model weights.
  - Distinguishes external retrieval (dynamic knowledge) from parametric training memory (static knowledge).
  - Accurately identifies that RAG mitigates hallucinations and enables access to private/real-time data.
- **Fail Criteria:**
  - Conflates RAG with model fine-tuning or full pre-training.
  - Claims RAG guarantees 100% truth without citation or verification.
  - Contains factual inaccuracies about LLM behavior or vector search.
- **Sample Failure Snippet:**
  > *"When RAG runs, it retrains the neural network on your company documents every time you ask a question."* (FAIL — Conflates retrieval with weight retraining).

---

### `CHK-102`: Target Persona Language & Readability
- **Dimension:** Beginner-Friendly Language
- **Target Audience:** 12th-grade graduate from India (non-English medium background)
- **Evaluation Method:** Deterministic Programmatic Metric (Flesch-Kincaid) + Sentence Length Analyzer
- **Pass Criteria:**
  - Flesch-Kincaid Grade Level **<= 8.0** (corresponds to middle-school reading ease, ideal for second-language learners).
  - Maximum sentence length **<= 22 words**.
  - Average sentence length **<= 14 words**.
  - Tone is warm, encouraging, conversational, using second-person ("you") and first-person plural ("we").
- **Fail Criteria:**
  - Flesch-Kincaid Grade Level > 8.0.
  - More than 2 sentences exceeding 22 words in length.
  - Use of academic, archaic, or unnecessarily complex vocabulary (e.g., *furthermore, quintessential, stochastic, parametric, ubiquity*).
- **Sample Failure Snippet:**
  > *"Notwithstanding the inherent stochasticity of autoregressive transformer architectures, the contextual integration of externalized corpora mitigates epistemic uncertainty."* (FAIL — Extreme cognitive overload).

---

### `CHK-103`: Teaches by Example (Cultural Anchor Analogy)
- **Dimension:** Teaches by Example
- **Evaluation Method:** Semantic Evaluator + Story Structure Matcher
- **Pass Criteria:**
  - Contains a primary, culturally accessible real-world analogy grounded in everyday Indian life:
    - **Primary Choice:** *The Open-Book vs Closed-Book Board Exam* (A closed-book student writes from memory and may guess; an open-book student opens the textbook, reads the exact page, and writes the answer).
    - **Alternative Approved Choices:** *The College Librarian consulting the catalog register*, or *The Kirana storekeeper checking the bahi-khata / inventory ledger*.
  - The analogy is not just decorative; it must be **explicitly mapped** to:
    1. The Question (Prompt)
    2. Finding the note (Retrieval)
    3. Putting note and question together (Augmentation)
    4. Writing the answer (Generation)
- **Fail Criteria:**
  - Purely theoretical explanation without a concrete real-world comparison.
  - Uses abstract or Western-centric analogies (e.g., filing tax returns with TurboTax, baseball box scores) that don't resonate with an Indian 12th-grade student.

---

### `CHK-104`: Clear, Zero Unexplained Jargon
- **Dimension:** Clear, No Unexplained Jargon
- **Evaluation Method:** Automated Jargon Lexicon Parser + Context Definition Verifier
- **Monitored Jargon List:**
  - `LLM / Large Language Model`
  - `Hallucination`
  - `Prompt`
  - `Vector Database / Embeddings`
  - `Context Window`
  - `Token`
- **Pass Criteria:**
  - Every monitored term is defined in plain, friendly language **either before or immediately following** its first appearance.
  - Example of an approved explanation: *"Hallucination (when the AI makes up fake information with full confidence, like a student guessing in a viva exam)"*.
- **Fail Criteria:**
  - Any monitored technical term appears without an immediate plain-language translation or analogy.
- **Sample Failure Snippet:**
  > *"We take the user prompt, convert it into dense vector embeddings, query the Pinecone vector database using cosine similarity, and append the payload to the context window."* (FAIL — 5 unexplained jargon terms in one sentence).

---

### `CHK-105`: Three-Pillar Curriculum Coverage
- **Dimension:** Covers Key Points
- **Evaluation Method:** Section Content & Intent Verifier
- **Pass Criteria:** Explicitly covers all three foundational pillars required by the assessment:
  1. **What It Is:** Definition of RAG and its three components (Retrieval, Augmentation, Generation).
  2. **Why It Matters:** The 3 major problems RAG solves:
     - Prevents "confident guessing" (hallucinations).
     - Allows access to fresh/real-time information without waiting for model retraining.
     - Protects private/internal data (e.g., college syllabus, internal company rules).
  3. **How It Works:** The complete end-to-end pipeline:
     - Storage/Indexing: Preparing and storing information chunks.
     - Search/Retrieval: Finding the most relevant note.
     - Augmentation: Injecting the note into the prompt.
     - Generation: Producing the final grounded answer.
- **Fail Criteria:**
  - Any of the three core pillars (What, Why, How) is missing or truncated into a single superficial sentence.

---

### `CHK-106`: Coherent Pedagogical Teaching Flow
- **Dimension:** Coherent Teaching Flow
- **Evaluation Method:** Heading Sequence & Pedagogical Transition Validator
- **Pass Criteria:** The lesson must follow the proven 8-stage scaffolded learning journey:
  1. **Hook & Problem Statement:** Why AI models make mistakes when relying only on memory.
  2. **Relatable Core Analogy:** The Open-Book Exam comparison.
  3. **Demystifying the Name:** Breaking down R - A - G letter by letter.
  4. **The 3-Step Machine:** Step-by-step technical explanation with diagram.
  5. **Concrete Indian Example:** A relatable query (e.g., checking Indian Railways rules or college scholarship guidelines).
  6. **Why This Builds Your AI Career:** Practical industry relevance for an aspiring AI professional.
  7. **Quick Comprehension Check:** 2-3 interactive questions.
  8. **Key Takeaway Cheat Sheet:** 1-minute summary.
- **Fail Criteria:**
  - Jumping into technical mechanics before establishing the problem or analogy.
  - Introducing quiz questions on topics not taught in the text.

---

### `CHK-107`: Scaffolded Formatting & Diagrams
- **Dimension:** Visual & Structural Clarity
- **Evaluation Method:** Markdown Structure & Visual Density Scanner
- **Pass Criteria:**
  - Uses visual callout blocks (`> 💡 Tip`, `> ⚠️ Common Pitfall`).
  - Contains an intuitive ASCII or Mermaid visual workflow diagram showing the data flow.
  - Text is chunked: no paragraph exceeds 80 words.
  - Bullet points and bold text highlight core terms.
- **Fail Criteria:**
  - Wall-of-text formatting with long unbroken paragraphs.
  - Absence of any visual flowchart or diagram.

---

### `CHK-108`: Active Learning Check
- **Dimension:** Active Learning & Comprehension
- **Evaluation Method:** Quiz Structure & Answer Parser
- **Pass Criteria:**
  - Includes at least 2 multiple-choice or quick-check questions.
  - Every option includes a plain-English explanation of why it is correct or incorrect.
  - Questions test core conceptual understanding (e.g., "Why does RAG prevent hallucinations?"), not superficial trivia.
- **Fail Criteria:**
  - No interactive questions included.
  - Questions provided without answers or explanations.

---

## 3. Rubric Evaluation Matrix Summary

```
+----------+------------------------------------+---------------+----------------------------+
| Check ID | Checkpoint Name                    | Gate Type     | Enforcement Engine         |
+----------+------------------------------------+---------------+----------------------------+
| CHK-101  | Factual Accuracy & Grounding       | Semantic Pass | LLM Judge + Assertions     |
| CHK-102  | Beginner Language (Grade <= 8.0)   | Deterministic | Flesch-Kincaid & Syllables |
| CHK-103  | Relatable Cultural Analogy         | Semantic Pass | LLM Judge + Keyword AST    |
| CHK-104  | Zero Unexplained Jargon            | Deterministic | Regex Jargon Extractor     |
| CHK-105  | Three-Pillar Curriculum Coverage   | Semantic Pass | Section AST Parser         |
| CHK-106  | Coherent Pedagogical Flow          | Deterministic | Heading Flow Graph         |
| CHK-107  | Scaffolded Formatting & Diagram    | Deterministic | Markdown Block Scanner     |
| CHK-108  | Active Learning Quiz with Feedback | Semantic Pass | Quiz AST Parser            |
+----------+------------------------------------+---------------+----------------------------+
```
A lesson is **`APPROVED_TO_SHIP`** if and only if:
$$\text{Status} = \bigwedge_{i=101}^{108} \text{CHK}_i == \text{PASS}$$
Otherwise: **`NEEDS_REVISION`** (triggers the Surgical Refiner Agent).

"""
Command Line Runner (Python)
Usage: python -m src.cli --topic "Introduction to RAG"
"""
import sys
import argparse
from .orchestrator import ContentLoopOrchestrator

def main():
    parser = argparse.ArgumentParser(description="GenAI Content Systems — Self-Evaluating Lesson Generator")
    parser.add_argument("--topic", "-t", default="Introduction to RAG", help="Lesson topic to generate and evaluate")
    parser.add_argument("--max-iter", type=int, default=4, help="Maximum allowed self-correction iterations")
    args = parser.parse_args()

    print("\n" + "=" * 70)
    print("   GENAI CONTENT SYSTEMS — SELF-EVALUATING LESSON GENERATOR (Python)")
    print("   Target: 12th-Grade Graduate (India, Non-English Medium Transition)")
    print("=" * 70 + "\n")
    print(f"📌 Input Topic: '{args.topic}'")
    print("Starting autonomous generation & rubric evaluation loop...\n")

    orchestrator = ContentLoopOrchestrator(max_iterations=args.max_iter)
    result = orchestrator.run_loop(args.topic)

    print("=" * 70)
    print("🏁 EXECUTION SUMMARY")
    print("=" * 70)
    print(f"Final Status:     {result['status']}")
    print(f"Iterations Run:   {result['iterations']}")
    print(f"Score Cleared:    {result['final_report'].score}")
    print(f"Shipped Lesson:   {result['shipped_path']}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()

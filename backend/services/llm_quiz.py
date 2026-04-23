import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a programming education expert. Generate quiz questions.
Always respond with ONLY valid JSON — no markdown, no explanation.
Format:
{
  "questions": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}
correct is the 0-based index of the correct option."""

def generate_quiz(topic_name: str, topic_description: str, difficulty: int) -> list[dict]:
    """
    Generate 3 MCQ questions for a topic using Groq LLM (llama3-8b-8192).
    Returns list of question dicts.
    """
    difficulty_map = {1: "beginner", 2: "easy", 3: "intermediate", 4: "hard", 5: "expert"}
    level = difficulty_map.get(difficulty, "intermediate")

    prompt = f"""Generate exactly 3 multiple-choice quiz questions about:
Topic: {topic_name}
Description: {topic_description}
Difficulty level: {level}

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Questions should test practical understanding, not just definitions
- Vary the question styles (conceptual, code output, debugging, best practice)
- For {level} level students"""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code blocks if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return data.get("questions", [])
    except Exception as e:
        print(f"LLM error: {e}")
        return _fallback_questions(topic_name)

def _fallback_questions(topic_name: str) -> list[dict]:
    """Fallback questions if LLM fails."""
    return [
        {
            "question": f"Which of the following best describes {topic_name}?",
            "options": [
                "A) A front-end styling framework",
                "B) A core web technology concept",
                "C) A database management system",
                "D) A version control system"
            ],
            "correct": 1,
            "explanation": f"{topic_name} is a core web technology concept used in modern development."
        },
        {
            "question": f"When learning {topic_name}, what is the recommended first step?",
            "options": [
                "A) Skip to advanced concepts",
                "B) Understand the fundamentals and practice small examples",
                "C) Memorise all documentation",
                "D) Build a large project immediately"
            ],
            "correct": 1,
            "explanation": "Understanding fundamentals through practice is the most effective learning approach."
        },
        {
            "question": f"Which resource is most useful when starting with {topic_name}?",
            "options": [
                "A) Academic research papers",
                "B) Official documentation and tutorials",
                "C) Only video courses",
                "D) Social media posts"
            ],
            "correct": 1,
            "explanation": "Official documentation combined with hands-on tutorials provides the best foundation."
        }
    ]

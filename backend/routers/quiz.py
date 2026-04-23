from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
from db.postgres import get_db
from db.neo4j_db import get_all_topics, get_learning_path
from models.models import User, TopicProgress, QuizAttempt
from routers.auth import get_current_user
from services.llm_quiz import generate_quiz
from services.bkt import update_bkt, mastery_reached

router = APIRouter()

class SubmitQuizRequest(BaseModel):
    topic_id: str
    answers: List[int]          # user's chosen option index per question
    questions: List[dict]       # the questions that were asked

@router.get("/generate/{topic_id}")
def get_quiz(
    topic_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = {t["id"]: t for t in get_all_topics()}
    topic = topics.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    questions = generate_quiz(
        topic_name=topic["name"],
        topic_description=topic["description"],
        difficulty=topic["difficulty"]
    )
    # Don't expose correct answers to frontend
    safe_questions = [
        {"question": q["question"], "options": q["options"]}
        for q in questions
    ]
    return {"topic_id": topic_id, "topic_name": topic["name"], "questions": safe_questions, "_raw": questions}

@router.post("/submit")
def submit_quiz(
    req: SubmitQuizRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = {t["id"]: t for t in get_all_topics()}
    topic = topics.get(req.topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Score the quiz
    score = 0
    results = []
    for i, (q, user_ans) in enumerate(zip(req.questions, req.answers)):
        correct_idx = q.get("correct", -1)
        is_correct = user_ans == correct_idx
        if is_correct:
            score += 1
        results.append({
            "question": q["question"],
            "your_answer": req.answers[i],
            "correct_answer": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    passed = score >= 2  # pass if 2 or 3 correct

    # Update or create TopicProgress
    prog = db.query(TopicProgress).filter_by(
        user_id=current_user.id, topic_id=req.topic_id
    ).first()
    if not prog:
        prog = TopicProgress(user_id=current_user.id, topic_id=req.topic_id)
        db.add(prog)

    # BKT update for each answer
    p_know = prog.p_know
    for q, user_ans in zip(req.questions, req.answers):
        correct_bool = user_ans == q.get("correct", -1)
        p_know = update_bkt(p_know, prog.p_learn, prog.p_slip, prog.p_guess, correct_bool)

    prog.p_know   = p_know
    prog.attempts += 1
    prog.correct  += score
    if passed:
        prog.status = "completed"
    else:
        prog.status = "unlocked"  # can retry

    db.add(QuizAttempt(
        user_id=current_user.id,
        topic_id=req.topic_id,
        score=score,
        passed=passed,
        questions=json.dumps(results)
    ))

    # If passed, unlock next available topics
    newly_unlocked = []
    if passed:
        completed_ids = [
            p.topic_id for p in
            db.query(TopicProgress).filter_by(user_id=current_user.id, status="completed").all()
        ]
        next_topics = get_learning_path(completed_ids)
        for nt in next_topics[:3]:
            ex = db.query(TopicProgress).filter_by(
                user_id=current_user.id, topic_id=nt["id"]
            ).first()
            if not ex:
                db.add(TopicProgress(user_id=current_user.id, topic_id=nt["id"], status="unlocked"))
                newly_unlocked.append(nt["name"])

    db.commit()

    # Resource suggestion on fail
    resource = None
    if not passed:
        resource = {
            "youtube": f"https://www.youtube.com/results?search_query={topic['name'].replace(' ','+')}+tutorial",
            "mdn": f"https://developer.mozilla.org/en-US/search?q={topic['name'].replace(' ','+')}",
            "message": f"Review {topic['name']} and try again. You scored {score}/3."
        }

    return {
        "score": score,
        "passed": passed,
        "p_know": round(p_know, 3),
        "mastery": mastery_reached(p_know),
        "results": results,
        "newly_unlocked": newly_unlocked,
        "resource_suggestion": resource
    }

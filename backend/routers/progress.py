from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.postgres import get_db
from db.neo4j_db import get_all_topics, get_learning_path
from models.models import User, TopicProgress, QuizAttempt
from routers.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    all_topics   = {t["id"]: t for t in get_all_topics()}
    all_progress = db.query(TopicProgress).filter_by(user_id=current_user.id).all()
    attempts     = db.query(QuizAttempt).filter_by(user_id=current_user.id).order_by(QuizAttempt.created_at.desc()).limit(10).all()

    completed = [p for p in all_progress if p.status == "completed"]
    unlocked  = [p for p in all_progress if p.status == "unlocked"]

    completed_ids = [p.topic_id for p in completed]
    next_path = get_learning_path(completed_ids)

    # Confusion detection: topics with > 2 attempts and p_know < 0.5
    confused_topics = [
        {
            "topic_id": p.topic_id,
            "topic_name": all_topics.get(p.topic_id, {}).get("name", p.topic_id),
            "p_know": round(p.p_know, 3),
            "attempts": p.attempts
        }
        for p in all_progress
        if p.attempts >= 2 and p.p_know < 0.5
    ]

    return {
        "username": current_user.username,
        "total_topics": len(all_topics),
        "completed_count": len(completed),
        "completion_pct": round(len(completed) / max(len(all_topics), 1) * 100, 1),
        "unlocked_count": len(unlocked),
        "completed_topics": [
            {"id": p.topic_id, "name": all_topics.get(p.topic_id, {}).get("name", p.topic_id), "p_know": round(p.p_know, 3)}
            for p in completed
        ],
        "unlocked_topics": [
            {"id": p.topic_id, "name": all_topics.get(p.topic_id, {}).get("name", p.topic_id), "difficulty": all_topics.get(p.topic_id, {}).get("difficulty", 1)}
            for p in unlocked
        ],
        "next_recommended": next_path[:3],
        "confused_topics": confused_topics,
        "recent_attempts": [
            {
                "topic_id": a.topic_id,
                "topic_name": all_topics.get(a.topic_id, {}).get("name", a.topic_id),
                "score": a.score,
                "passed": a.passed,
                "date": a.created_at.isoformat() if a.created_at else None
            }
            for a in attempts
        ]
    }

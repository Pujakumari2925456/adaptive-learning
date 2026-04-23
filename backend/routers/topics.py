from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from db.postgres import get_db
from db.neo4j_db import get_all_topics, get_graph_data, get_learning_path, get_prerequisites
from models.models import User, TopicProgress
from routers.auth import get_current_user

router = APIRouter()

class KnownTopicsRequest(BaseModel):
    known_topic_ids: List[str]

@router.get("/all")
def all_topics():
    return get_all_topics()

@router.get("/graph")
def graph_data():
    return get_graph_data()

@router.post("/learning-path")
def learning_path(req: KnownTopicsRequest):
    return get_learning_path(req.known_topic_ids)

@router.get("/prerequisites/{topic_id}")
def prerequisites(topic_id: str):
    return get_prerequisites(topic_id)

@router.post("/mark-known")
def mark_known(
    req: KnownTopicsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark topics as already known during onboarding."""
    for tid in req.known_topic_ids:
        prog = db.query(TopicProgress).filter_by(
            user_id=current_user.id, topic_id=tid
        ).first()
        if not prog:
            prog = TopicProgress(
                user_id=current_user.id,
                topic_id=tid,
                status="completed",
                p_know=1.0,
                correct=1,
                attempts=1
            )
            db.add(prog)
        else:
            prog.status = "completed"
            prog.p_know = 1.0
    db.commit()
    # Unlock next topics in path
    path = get_learning_path(req.known_topic_ids)
    for topic in path[:3]:
        existing = db.query(TopicProgress).filter_by(
            user_id=current_user.id, topic_id=topic["id"]
        ).first()
        if not existing:
            db.add(TopicProgress(user_id=current_user.id, topic_id=topic["id"], status="unlocked"))
    db.commit()
    return {"message": "Topics marked as known", "unlocked": len(path)}

@router.get("/my-progress")
def my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = db.query(TopicProgress).filter_by(user_id=current_user.id).all()
    return [
        {
            "topic_id": p.topic_id,
            "status": p.status,
            "p_know": round(p.p_know, 3),
            "attempts": p.attempts,
            "correct": p.correct,
        }
        for p in progress
    ]

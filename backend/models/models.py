from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.postgres import Base

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    username      = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    progress      = relationship("TopicProgress", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

class TopicProgress(Base):
    __tablename__ = "topic_progress"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id     = Column(String, nullable=False)   # Neo4j topic id
    status       = Column(String, default="locked") # locked | unlocked | completed
    # BKT fields
    p_know       = Column(Float, default=0.1)        # P(Know) — prior
    p_learn      = Column(Float, default=0.4)        # P(Learn)
    p_slip       = Column(Float, default=0.1)        # P(Slip)
    p_guess      = Column(Float, default=0.2)        # P(Guess)
    attempts     = Column(Integer, default=0)
    correct      = Column(Integer, default=0)
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    user         = relationship("User", back_populates="progress")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id     = Column(String, nullable=False)
    score        = Column(Integer, nullable=False)   # 0–3
    passed       = Column(Boolean, default=False)
    questions    = Column(Text)                      # JSON string
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    user         = relationship("User", back_populates="quiz_attempts")

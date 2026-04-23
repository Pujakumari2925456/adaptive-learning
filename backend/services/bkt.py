"""
Bayesian Knowledge Tracing (BKT)
---------------------------------
BKT models whether a student knows a skill as a hidden state.

Parameters:
  p_know  : P(L0)   – probability student already knows skill
  p_learn : P(T)    – probability of learning after a practice opportunity
  p_slip  : P(S)    – probability of wrong answer despite knowing
  p_guess : P(G)    – probability of correct answer without knowing

Update rule after each response:
  If correct:
    p_know_given_correct = p_know * (1 - p_slip)
                         / (p_know*(1-p_slip) + (1-p_know)*p_guess)
  If incorrect:
    p_know_given_wrong  = p_know * p_slip
                        / (p_know*p_slip + (1-p_know)*(1-p_guess))

  Then apply learning:
    p_know_new = p_know_updated + (1 - p_know_updated) * p_learn
"""

def update_bkt(p_know: float, p_learn: float, p_slip: float, p_guess: float, correct: bool) -> float:
    if correct:
        numerator   = p_know * (1 - p_slip)
        denominator = numerator + (1 - p_know) * p_guess
    else:
        numerator   = p_know * p_slip
        denominator = numerator + (1 - p_know) * (1 - p_guess)

    if denominator == 0:
        p_know_updated = p_know
    else:
        p_know_updated = numerator / denominator

    # Apply learning probability
    p_know_new = p_know_updated + (1 - p_know_updated) * p_learn
    return min(max(p_know_new, 0.0), 1.0)  # clamp [0, 1]


def mastery_reached(p_know: float, threshold: float = 0.95) -> bool:
    return p_know >= threshold

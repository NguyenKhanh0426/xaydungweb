export const srsService = {
  calculateNextState(currentState, grade) {
    let repetitionCount = currentState.repetition_count;
    let intervalDays = currentState.interval_days;
    let easeFactor = Number(currentState.ease_factor);
    let lapseCount = currentState.lapse_count;
    let consecutiveCorrect = currentState.consecutive_correct;

    if (grade === 'again') {
      repetitionCount = 0;
      intervalDays = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      lapseCount += 1;
      consecutiveCorrect = 0;
    } else if (grade === 'hard') {
      repetitionCount += 1;
      intervalDays = Math.max(1, Math.round(Math.max(1, intervalDays) * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      consecutiveCorrect += 1;
    } else if (grade === 'good') {
      repetitionCount += 1;
      if (repetitionCount === 1) intervalDays = 1;
      else if (repetitionCount === 2) intervalDays = 3;
      else intervalDays = Math.round(Math.max(1, intervalDays) * easeFactor);
      consecutiveCorrect += 1;
    } else if (grade === 'easy') {
      repetitionCount += 1;
      intervalDays = Math.round(Math.max(1, intervalDays || 1) * easeFactor * 1.3);
      easeFactor += 0.15;
      consecutiveCorrect += 1;
    }

    const learningStatus = repetitionCount >= 5 ? 'mastered' : repetitionCount >= 2 ? 'review' : 'learning';
    const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

    return {
      repetitionCount,
      intervalDays,
      easeFactor: Number(easeFactor.toFixed(2)),
      lapseCount,
      consecutiveCorrect,
      learningStatus,
      nextReviewAt
    };
  }
};

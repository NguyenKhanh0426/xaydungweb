import { pool } from '../config/db.js';

export const flashcardRepository = {
  async createFlashcard(userId, vocabulary) {
    const [result] = await pool.query(
      `INSERT INTO flashcards (user_id, vocabulary_id, front_text, back_text, card_type)
       VALUES (?, ?, ?, ?, 'basic')`,
      [userId, vocabulary.id, vocabulary.word, vocabulary.meaning_vi]
    );

    await pool.query(
      `INSERT INTO flashcard_learning_state
       (flashcard_id, user_id, next_review_at, learning_status)
       VALUES (?, ?, NOW(), 'new')`,
      [result.insertId, userId]
    );

    return result.insertId;
  },

  async getDueCards(userId) {
    const [rows] = await pool.query(
      `SELECT f.id, f.front_text, f.back_text, v.phonetic, v.example_sentence,
              s.repetition_count, s.interval_days, s.ease_factor, s.next_review_at, s.learning_status
       FROM flashcards f
       INNER JOIN flashcard_learning_state s ON s.flashcard_id = f.id
       LEFT JOIN vocabularies v ON v.id = f.vocabulary_id
       WHERE f.user_id = ? AND s.next_review_at <= NOW() AND f.is_active = 1
       ORDER BY s.next_review_at ASC
       LIMIT 20`,
      [userId]
    );
    return rows;
  },

  async findStateByFlashcardId(flashcardId, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM flashcard_learning_state WHERE flashcard_id = ? AND user_id = ?',
      [flashcardId, userId]
    );
    return rows[0] || null;
  },

  async saveReview(review) {
    await pool.query(
      `INSERT INTO flashcard_reviews
      (flashcard_id, user_id, grade, response_time_ms, old_interval_days, new_interval_days, old_ease_factor, new_ease_factor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        review.flashcardId,
        review.userId,
        review.grade,
        review.responseTimeMs || null,
        review.oldIntervalDays,
        review.newIntervalDays,
        review.oldEaseFactor,
        review.newEaseFactor
      ]
    );
  },

  async updateState(flashcardId, userId, payload) {
    const {
      repetitionCount,
      intervalDays,
      easeFactor,
      lapseCount,
      learningStatus,
      lastGrade,
      consecutiveCorrect,
      nextReviewAt
    } = payload;

    await pool.query(
      `UPDATE flashcard_learning_state
       SET repetition_count = ?, interval_days = ?, ease_factor = ?, lapse_count = ?,
           learning_status = ?, last_grade = ?, consecutive_correct = ?,
           last_reviewed_at = NOW(), next_review_at = ?
       WHERE flashcard_id = ? AND user_id = ?`,
      [
        repetitionCount,
        intervalDays,
        easeFactor,
        lapseCount,
        learningStatus,
        lastGrade,
        consecutiveCorrect,
        nextReviewAt,
        flashcardId,
        userId
      ]
    );
  }
};

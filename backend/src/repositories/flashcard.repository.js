import { pool } from '../config/db.js';

export const flashcardRepository = {
  async findExistingFlashcard(userId, vocabularyId) {
    const [rows] = await pool.query(
      'SELECT id FROM the_ghi_nho WHERE nguoi_dung_id = ? AND tu_vung_id = ? AND loai_the = ? LIMIT 1',
      [userId, vocabularyId, 'basic']
    );
    return rows[0] || null;
  },

  async createFlashcard(userId, vocabulary) {
    const [result] = await pool.query(
      `INSERT INTO the_ghi_nho (nguoi_dung_id, tu_vung_id, mat_truoc, mat_sau, loai_the)
       VALUES (?, ?, ?, ?, 'basic')`,
      [userId, vocabulary.id, vocabulary.word, vocabulary.meaning_vi]
    );

    await pool.query(
      `INSERT INTO trang_thai_hoc_the
       (the_id, nguoi_dung_id, on_tiep_theo_luc, trang_thai_hoc)
       VALUES (?, ?, NOW(), 'new')`,
      [result.insertId, userId]
    );

    return result.insertId;
  },

  async getDueCards(userId) {
    const [rows] = await pool.query(
      `SELECT tg.id, tg.mat_truoc AS front_text, tg.mat_sau AS back_text,
              tv.phien_am AS phonetic, tv.cau_vi_du AS example_sentence,
              th.so_lan_lap AS repetition_count, th.so_ngay_lap AS interval_days,
              th.he_so_de AS ease_factor, th.on_tiep_theo_luc AS next_review_at,
              th.trang_thai_hoc AS learning_status
       FROM the_ghi_nho tg
       INNER JOIN trang_thai_hoc_the th ON th.the_id = tg.id
       LEFT JOIN tu_vung tv ON tv.id = tg.tu_vung_id
       WHERE tg.nguoi_dung_id = ? AND th.on_tiep_theo_luc <= NOW() AND tg.dang_hoat_dong = 1
       ORDER BY th.on_tiep_theo_luc ASC
       LIMIT 20`,
      [userId]
    );
    return rows;
  },

  async findStateByFlashcardId(flashcardId, userId) {
    const [rows] = await pool.query(
      `SELECT the_id AS flashcard_id, nguoi_dung_id AS user_id, so_lan_lap AS repetition_count,
              so_ngay_lap AS interval_days, he_so_de AS ease_factor, on_cuoi_luc AS last_reviewed_at,
              on_tiep_theo_luc AS next_review_at, so_lan_quen AS lapse_count,
              trang_thai_hoc AS learning_status, muc_danh_gia_cuoi AS last_grade,
              so_lan_dung_lien_tiep AS consecutive_correct
       FROM trang_thai_hoc_the WHERE the_id = ? AND nguoi_dung_id = ?`,
      [flashcardId, userId]
    );
    return rows[0] || null;
  },

  async saveReview(review) {
    await pool.query(
      `INSERT INTO lich_su_on_the
      (the_id, nguoi_dung_id, muc_danh_gia, thoi_gian_tra_loi_ms, so_ngay_lap_cu, so_ngay_lap_moi, he_so_de_cu, he_so_de_moi)
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
      `UPDATE trang_thai_hoc_the
       SET so_lan_lap = ?, so_ngay_lap = ?, he_so_de = ?, so_lan_quen = ?,
           trang_thai_hoc = ?, muc_danh_gia_cuoi = ?, so_lan_dung_lien_tiep = ?,
           on_cuoi_luc = NOW(), on_tiep_theo_luc = ?
       WHERE the_id = ? AND nguoi_dung_id = ?`,
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

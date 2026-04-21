import { pool } from '../config/db.js';
import { summaryRepository } from './summary.repository.js';

const alphabet = ['A', 'B', 'C', 'D'];

export const testRepository = {
  async createMiniTest(userId, setInfo, questions) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [testResult] = await connection.query(
        `INSERT INTO bai_kiem_tra
         (tieu_de, loai_bai_kiem_tra, thoi_luong_phut, tong_cau_hoi, muc_do_kho, dang_hoat_dong, tao_boi)
         VALUES (?, 'vocabulary', ?, ?, 1, 1, ?)`,
        [`Mini test - ${setInfo.title}`, Math.max(5, questions.length * 2), questions.length, userId]
      );

      for (const question of questions) {
        const [questionResult] = await connection.query(
          `INSERT INTO cau_hoi
           (bai_kiem_tra_id, loai_cau_hoi, noi_dung, giai_thich, dap_an_dung_text, muc_do_kho)
           VALUES (?, 'single_choice', ?, ?, ?, ?)`,
          [
            testResult.insertId,
            `Chọn nghĩa đúng cho từ: ${question.word}`,
            question.explanation,
            question.correctOption.text,
            question.difficultyLevel || 1
          ]
        );

        for (const [index, option] of question.options.entries()) {
          await connection.query(
            `INSERT INTO lua_chon_cau_hoi
             (cau_hoi_id, nhan_lua_chon, noi_dung_lua_chon, la_dap_an_dung)
             VALUES (?, ?, ?, ?)`,
            [questionResult.insertId, alphabet[index], option.text, option.isCorrect ? 1 : 0]
          );
        }
      }

      const [attemptResult] = await connection.query(
        `INSERT INTO lan_lam_bai
         (nguoi_dung_id, bai_kiem_tra_id, bat_dau_luc, trang_thai, thoi_gian_lam_giay)
         VALUES (?, ?, NOW(), 'in_progress', 0)`,
        [userId, testResult.insertId]
      );

      await connection.commit();
      return { testId: testResult.insertId, attemptId: attemptResult.insertId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getAttemptQuestions(userId, attemptId) {
    const [attemptRows] = await pool.query(
      `SELECT llb.id, llb.bai_kiem_tra_id AS test_id, bkt.tieu_de AS title
       FROM lan_lam_bai llb
       INNER JOIN bai_kiem_tra bkt ON bkt.id = llb.bai_kiem_tra_id
       WHERE llb.id = ? AND llb.nguoi_dung_id = ?`,
      [attemptId, userId]
    );
    const attempt = attemptRows[0];
    if (!attempt) return null;

    const [questionRows] = await pool.query(
      `SELECT ch.id, ch.noi_dung AS content, ch.giai_thich AS explanation, ch.dap_an_dung_text AS correct_text,
              lc.id AS option_id, lc.nhan_lua_chon AS option_label, lc.noi_dung_lua_chon AS option_text, lc.la_dap_an_dung AS is_correct
       FROM cau_hoi ch
       INNER JOIN lua_chon_cau_hoi lc ON lc.cau_hoi_id = ch.id
       WHERE ch.bai_kiem_tra_id = ?
       ORDER BY ch.id ASC, lc.id ASC`,
      [attempt.test_id]
    );

    const questionsMap = new Map();
    for (const row of questionRows) {
      if (!questionsMap.has(row.id)) {
        questionsMap.set(row.id, {
          id: row.id,
          content: row.content,
          explanation: row.explanation,
          correctText: row.correct_text,
          options: []
        });
      }
      questionsMap.get(row.id).options.push({
        id: row.option_id,
        label: row.option_label,
        text: row.option_text,
        isCorrect: Boolean(row.is_correct)
      });
    }

    return {
      ...attempt,
      questions: Array.from(questionsMap.values())
    };
  },

  async saveAttemptResult(userId, attemptId, attemptData, answersPayload, timeSpentSeconds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let correctCount = 0;
      let wrongCount = 0;
      let blankCount = 0;
      const detailedResults = [];

      for (const question of attemptData.questions) {
        const answer = answersPayload.find((item) => Number(item.questionId) === Number(question.id));
        const selectedOption = question.options.find((item) => Number(item.id) === Number(answer?.selectedOptionId));
        const isCorrect = selectedOption ? selectedOption.isCorrect : null;
        if (selectedOption && isCorrect) correctCount += 1;
        else if (selectedOption && !isCorrect) wrongCount += 1;
        else blankCount += 1;

       await connection.query(
       `INSERT INTO cau_tra_loi_bai_test
        (lan_lam_id, cau_hoi_id, lua_chon_id, cau_tra_loi_text, la_dap_an_dung, diem_duoc_tinh)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE lua_chon_id = VALUES(lua_chon_id), cau_tra_loi_text = VALUES(cau_tra_loi_text),
                           la_dap_an_dung = VALUES(la_dap_an_dung), diem_duoc_tinh = VALUES(diem_duoc_tinh)`,
  [attemptId, question.id, selectedOption?.id || null, selectedOption?.text || null, isCorrect === null ? null : (isCorrect ? 1 : 0), isCorrect ? 1 : 0]
);
        detailedResults.push({
          questionId: question.id,
          content: question.content,
          selectedOptionId: selectedOption?.id || null,
          selectedText: selectedOption?.text || null,
          correctText: question.correctText,
          isCorrect: Boolean(isCorrect),
          explanation: question.explanation
        });
      }

      const totalQuestions = attemptData.questions.length;
      const rawScore = correctCount;
      const percentageScore = totalQuestions ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;
      const expEarned = correctCount * 5;

      await connection.query(
        `UPDATE lan_lam_bai
         SET nop_luc = NOW(), trang_thai = 'graded', thoi_gian_lam_giay = ?, diem_tho = ?, diem_phan_tram = ?
         WHERE id = ? AND nguoi_dung_id = ?`,
        [timeSpentSeconds || 0, rawScore, percentageScore, attemptId, userId]
      );

      await connection.query(
        `INSERT INTO ket_qua_bai_test
         (lan_lam_id, nguoi_dung_id, bai_kiem_tra_id, so_cau_dung, so_cau_sai, so_cau_bo, ty_le_chinh_xac)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [attemptId, userId, attemptData.test_id, correctCount, wrongCount, blankCount, percentageScore]
      );

      await summaryRepository.addCompletedTest(userId, expEarned, timeSpentSeconds || 0, connection);

      await connection.commit();

      return {
        title: attemptData.title,
        totalQuestions,
        correctCount,
        wrongCount,
        blankCount,
        rawScore,
        percentageScore,
        expEarned,
        results: detailedResults
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getRecentAttempts(userId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT llb.id, bkt.tieu_de AS title, bkt.loai_bai_kiem_tra AS test_type,
              llb.diem_phan_tram AS percentage_score, llb.tao_luc AS created_at
       FROM lan_lam_bai llb
       INNER JOIN bai_kiem_tra bkt ON bkt.id = llb.bai_kiem_tra_id
       WHERE llb.nguoi_dung_id = ?
       ORDER BY llb.tao_luc DESC
       LIMIT ?`,
      [userId, Number(limit)]
    );
    return rows;
  },

  async getAttemptHistory(userId, filters = {}) {
    const params = [userId];
    let dateSql = '';
    if (filters.date) {
      dateSql = ' AND DATE(llb.nop_luc) = ?';
      params.push(filters.date);
    }

    const [rows] = await pool.query(
      `SELECT llb.id AS attempt_id, llb.nop_luc AS submitted_at, llb.thoi_gian_lam_giay AS time_spent_seconds,
              llb.diem_phan_tram AS percentage_score, bkt.tieu_de AS title, bkt.loai_bai_kiem_tra AS test_type,
              kq.so_cau_dung AS correct_count, kq.so_cau_sai AS wrong_count, kq.so_cau_bo AS blank_count,
              ch.id AS question_id, ch.noi_dung AS question_content, ch.giai_thich AS explanation, ch.dap_an_dung_text AS correct_text,
              ctl.lua_chon_id AS selected_option_id, ctl.cau_tra_loi_text AS selected_text, ctl.la_dap_an_dung AS is_correct
       FROM lan_lam_bai llb
       INNER JOIN bai_kiem_tra bkt ON bkt.id = llb.bai_kiem_tra_id
       LEFT JOIN ket_qua_bai_test kq ON kq.lan_lam_id = llb.id
       INNER JOIN cau_hoi ch ON ch.bai_kiem_tra_id = bkt.id
       LEFT JOIN cau_tra_loi_bai_test ctl ON ctl.lan_lam_id = llb.id AND ctl.cau_hoi_id = ch.id
       WHERE llb.nguoi_dung_id = ? AND llb.trang_thai = 'graded'${dateSql}
       ORDER BY llb.nop_luc DESC, llb.id DESC, ch.id ASC`,
      params
    );

    const attemptMap = new Map();
    for (const row of rows) {
      if (!attemptMap.has(row.attempt_id)) {
        attemptMap.set(row.attempt_id, {
          id: row.attempt_id,
          title: row.title,
          testType: row.test_type,
          submittedAt: row.submitted_at,
          timeSpentSeconds: row.time_spent_seconds || 0,
          percentageScore: row.percentage_score ?? 0,
          correctCount: row.correct_count ?? 0,
          wrongCount: row.wrong_count ?? 0,
          blankCount: row.blank_count ?? 0,
          results: []
        });
      }

      attemptMap.get(row.attempt_id).results.push({
        questionId: row.question_id,
        content: row.question_content,
        selectedOptionId: row.selected_option_id,
        selectedText: row.selected_text,
        correctText: row.correct_text,
        isCorrect: row.is_correct === null ? null : Boolean(row.is_correct),
        explanation: row.explanation
      });
    }

    return Array.from(attemptMap.values());
  }
};

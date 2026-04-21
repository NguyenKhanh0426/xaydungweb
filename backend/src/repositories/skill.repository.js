import { pool } from '../config/db.js';
import { summaryRepository } from './summary.repository.js';

const mapSkillLog = (row) => ({
  id: row.id,
  skillType: row.skill_type,
  title: row.title,
  description: row.description,
  studyMinutes: row.study_minutes,
  score: row.score,
  studiedAt: row.studied_at,
  createdAt: row.created_at
});

export const skillRepository = {
  async createSkillLog(userId, payload) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        `INSERT INTO nhat_ky_ky_nang
         (nguoi_dung_id, loai_ky_nang, tieu_de, mo_ta, phut_hoc, diem_so, hoc_luc)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, payload.skillType, payload.title, payload.description || null, payload.studyMinutes, payload.score, payload.studiedAt]
      );

      await summaryRepository.addSkillLogSummary(userId, payload.skillType, payload.studyMinutes, payload.studiedAt, connection);
      await connection.commit();

      const [rows] = await pool.query(
        `SELECT id, loai_ky_nang AS skill_type, tieu_de AS title, mo_ta AS description,
                phut_hoc AS study_minutes, diem_so AS score, hoc_luc AS studied_at, tao_luc AS created_at
         FROM nhat_ky_ky_nang WHERE id = ?`,
        [result.insertId]
      );
      return mapSkillLog(rows[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getSkillLogs(userId, filters = {}) {
    const conditions = ['nguoi_dung_id = ?'];
    const params = [userId];

    if (filters.skillType) {
      conditions.push('loai_ky_nang = ?');
      params.push(filters.skillType);
    }

    const [rows] = await pool.query(
      `SELECT id, loai_ky_nang AS skill_type, tieu_de AS title, mo_ta AS description,
              phut_hoc AS study_minutes, diem_so AS score, hoc_luc AS studied_at, tao_luc AS created_at
       FROM nhat_ky_ky_nang
       WHERE ${conditions.join(' AND ')}
       ORDER BY hoc_luc DESC, id DESC`,
      params
    );

    return rows.map(mapSkillLog);
  },

  async deleteSkillLog(userId, skillLogId) {
    const [result] = await pool.query('DELETE FROM nhat_ky_ky_nang WHERE id = ? AND nguoi_dung_id = ?', [skillLogId, userId]);
    return result.affectedRows > 0;
  }
};

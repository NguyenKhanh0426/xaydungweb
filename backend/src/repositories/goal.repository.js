import { pool } from '../config/db.js';

const goalSelect = `
  SELECT id,
         loai_muc_tieu AS goal_type,
         gia_tri_muc_tieu AS target_value,
         gia_tri_hien_tai AS current_value,
         don_vi_muc_tieu AS target_unit,
         ngay_bat_dau AS start_date,
         ngay_muc_tieu AS target_date,
         trang_thai AS status,
         mo_ta AS description,
         tao_luc AS created_at,
         cap_nhat_luc AS updated_at,
         CASE
           WHEN gia_tri_muc_tieu IS NULL OR gia_tri_muc_tieu <= 0 THEN 0
           ELSE LEAST(100, ROUND((COALESCE(gia_tri_hien_tai, 0) / gia_tri_muc_tieu) * 100, 2))
         END AS progress_percentage,
         CASE
           WHEN ngay_muc_tieu IS NULL THEN NULL
           ELSE DATEDIFF(ngay_muc_tieu, CURDATE())
         END AS days_remaining
  FROM muc_tieu_nguoi_dung
`;

export const goalRepository = {
  async getGoals(userId, status = null) {
    const conditions = ['nguoi_dung_id = ?'];
    const params = [userId];
    if (status && status !== 'all') {
      conditions.push('trang_thai = ?');
      params.push(status);
    }

    const [rows] = await pool.query(
      `${goalSelect}
       WHERE ${conditions.join(' AND ')}
       ORDER BY trang_thai = 'active' DESC, ngay_muc_tieu IS NULL, ngay_muc_tieu ASC, tao_luc DESC`,
      params
    );
    return rows;
  },

  async createGoal(userId, payload) {
    const {
      goalType,
      targetValue = null,
      currentValue = 0,
      targetUnit = null,
      startDate,
      targetDate = null,
      description = null
    } = payload;
    const [result] = await pool.query(
      `INSERT INTO muc_tieu_nguoi_dung
       (nguoi_dung_id, loai_muc_tieu, gia_tri_muc_tieu, gia_tri_hien_tai, don_vi_muc_tieu, ngay_bat_dau, ngay_muc_tieu, mo_ta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, goalType, targetValue, currentValue || 0, targetUnit, startDate, targetDate, description]
    );
    const [rows] = await pool.query(`${goalSelect} WHERE id = ?`, [result.insertId]);
    return rows[0];
  },

  async updateGoal(userId, goalId, payload) {
    const currentGoal = await this.findGoalById(goalId, userId);
    if (!currentGoal) return null;

    const nextStatus = payload.status || currentGoal.status;
    const nextCurrentValue = payload.currentValue ?? currentGoal.current_value ?? 0;

    await pool.query(
      `UPDATE muc_tieu_nguoi_dung
       SET gia_tri_hien_tai = ?, trang_thai = ?, ngay_muc_tieu = ?, mo_ta = ?
       WHERE id = ? AND nguoi_dung_id = ?`,
      [
        nextCurrentValue,
        nextStatus,
        payload.targetDate ?? currentGoal.target_date,
        payload.description ?? currentGoal.description,
        goalId,
        userId
      ]
    );

    const [rows] = await pool.query(`${goalSelect} WHERE id = ? AND nguoi_dung_id = ?`, [goalId, userId]);
    return rows[0] || null;
  },

  async findGoalById(goalId, userId) {
    const [rows] = await pool.query(
      `SELECT id,
              loai_muc_tieu AS goal_type,
              gia_tri_muc_tieu AS target_value,
              gia_tri_hien_tai AS current_value,
              don_vi_muc_tieu AS target_unit,
              ngay_bat_dau AS start_date,
              ngay_muc_tieu AS target_date,
              trang_thai AS status,
              mo_ta AS description
       FROM muc_tieu_nguoi_dung
       WHERE id = ? AND nguoi_dung_id = ?`,
      [goalId, userId]
    );
    return rows[0] || null;
  }
};

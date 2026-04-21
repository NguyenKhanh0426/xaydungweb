import { pool } from '../config/db.js';

const mapReminder = (row) => ({
  id: row.id,
  reminderTime: row.reminder_time,
  daysOfWeek: (row.days_of_week || '').split(',').filter(Boolean),
  channel: row.channel,
  isEnabled: Boolean(row.is_enabled),
  message: row.message,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const reminderRepository = {
  async getReminders(userId) {
    const [rows] = await pool.query(
      `SELECT id, gio_nhac AS reminder_time, ngay_trong_tuan AS days_of_week,
              kenh_nhac AS channel, da_bat AS is_enabled, noi_dung AS message,
              tao_luc AS created_at, cap_nhat_luc AS updated_at
       FROM nhac_nho_hoc_tap
       WHERE nguoi_dung_id = ?
       ORDER BY da_bat DESC, gio_nhac ASC`,
      [userId]
    );
    return rows.map(mapReminder);
  },

  async createReminder(userId, payload) {
    const [result] = await pool.query(
      `INSERT INTO nhac_nho_hoc_tap
       (nguoi_dung_id, gio_nhac, ngay_trong_tuan, kenh_nhac, da_bat, noi_dung)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, payload.reminderTime, payload.daysOfWeek.join(','), payload.channel, payload.isEnabled ? 1 : 0, payload.message || null]
    );

    const [rows] = await pool.query(
      `SELECT id, gio_nhac AS reminder_time, ngay_trong_tuan AS days_of_week,
              kenh_nhac AS channel, da_bat AS is_enabled, noi_dung AS message,
              tao_luc AS created_at, cap_nhat_luc AS updated_at
       FROM nhac_nho_hoc_tap WHERE id = ?`,
      [result.insertId]
    );
    return mapReminder(rows[0]);
  },

  async updateReminder(userId, reminderId, payload) {
    await pool.query(
      `UPDATE nhac_nho_hoc_tap
       SET gio_nhac = ?, ngay_trong_tuan = ?, kenh_nhac = ?, da_bat = ?, noi_dung = ?
       WHERE id = ? AND nguoi_dung_id = ?`,
      [payload.reminderTime, payload.daysOfWeek.join(','), payload.channel, payload.isEnabled ? 1 : 0, payload.message || null, reminderId, userId]
    );

    const [rows] = await pool.query(
      `SELECT id, gio_nhac AS reminder_time, ngay_trong_tuan AS days_of_week,
              kenh_nhac AS channel, da_bat AS is_enabled, noi_dung AS message,
              tao_luc AS created_at, cap_nhat_luc AS updated_at
       FROM nhac_nho_hoc_tap WHERE id = ? AND nguoi_dung_id = ?`,
      [reminderId, userId]
    );
    return rows[0] ? mapReminder(rows[0]) : null;
  },

  async deleteReminder(userId, reminderId) {
    const [result] = await pool.query('DELETE FROM nhac_nho_hoc_tap WHERE id = ? AND nguoi_dung_id = ?', [reminderId, userId]);
    return result.affectedRows > 0;
  }
};

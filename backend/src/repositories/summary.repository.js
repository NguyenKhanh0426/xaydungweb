import { pool } from '../config/db.js';

export const summaryRepository = {
  async ensureDailySummary(userId, dateTime = new Date(), executor = pool) {
    const summaryDate = new Date(dateTime).toISOString().slice(0, 10);
    await executor.query(
      `INSERT INTO tong_hop_hoc_tap_hang_ngay (nguoi_dung_id, ngay_tong_hop)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE cap_nhat_luc = CURRENT_TIMESTAMP`,
      [userId, summaryDate]
    );
    return summaryDate;
  },

  async addStudyMinutes(userId, minutes, dateTime = new Date(), executor = pool) {
    if (!minutes || Number(minutes) <= 0) return;
    const summaryDate = await this.ensureDailySummary(userId, dateTime, executor);

    await executor.query(
      `UPDATE thong_ke_nguoi_dung
       SET tong_phut_hoc = tong_phut_hoc + ?, ngay_hoc_cuoi = ?
       WHERE nguoi_dung_id = ?`,
      [Number(minutes), summaryDate, userId]
    );

    await executor.query(
      `UPDATE tong_hop_hoc_tap_hang_ngay
       SET total_minutes = total_minutes + ?
       WHERE nguoi_dung_id = ? AND ngay_tong_hop = ?`,
      [Number(minutes), userId, summaryDate]
    );
  },

  async addExp(userId, exp, description = null, sourceType = 'test', sourceId = null, dateTime = new Date(), executor = pool) {
    if (!exp || Number(exp) <= 0) return;
    const summaryDate = await this.ensureDailySummary(userId, dateTime, executor);

    await executor.query(
      `UPDATE thong_ke_nguoi_dung
       SET tong_exp = tong_exp + ?
       WHERE nguoi_dung_id = ?`,
      [Number(exp), userId]
    );

    await executor.query(
      `UPDATE tong_hop_hoc_tap_hang_ngay
       SET exp_nhan_duoc = exp_nhan_duoc + ?
       WHERE nguoi_dung_id = ? AND ngay_tong_hop = ?`,
      [Number(exp), userId, summaryDate]
    );

    await executor.query(
      `INSERT INTO nhat_ky_exp (nguoi_dung_id, loai_nguon, nguon_id, exp_nhan_duoc, mo_ta)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, sourceType, sourceId, Number(exp), description]
    );
  },

  async addSkillLogSummary(userId, skillType, minutes, studiedAt, executor = pool) {
    const summaryDate = await this.ensureDailySummary(userId, studiedAt, executor);
    const counters = {
      listening: 'so_bai_nghe',
      speaking: 'so_ban_ghi_noi',
      reading: 'so_bai_doc',
      writing: 'so_bai_viet'
    };
    const targetCounter = counters[skillType];
    if (!targetCounter) return summaryDate;

    await this.addStudyMinutes(userId, minutes, studiedAt, executor);

    await executor.query(
      `UPDATE tong_hop_hoc_tap_hang_ngay
       SET ${targetCounter} = ${targetCounter} + 1
       WHERE nguoi_dung_id = ? AND ngay_tong_hop = ?`,
      [userId, summaryDate]
    );

    return summaryDate;
  },

  async addCompletedTest(userId, exp, timeSpentSeconds, executor = pool) {
    const date = new Date();
    const summaryDate = await this.ensureDailySummary(userId, date, executor);
    await executor.query(
      `UPDATE thong_ke_nguoi_dung
       SET tong_bai_da_lam = tong_bai_da_lam + ?
       WHERE nguoi_dung_id = ?`,
      [1, userId]
    );
    await executor.query(
      `UPDATE tong_hop_hoc_tap_hang_ngay
       SET so_bai_hoan_thanh = so_bai_hoan_thanh + ?, total_minutes = total_minutes + ?
       WHERE nguoi_dung_id = ? AND ngay_tong_hop = ?`,
      [1, Math.max(1, Math.round(Number(timeSpentSeconds || 0) / 60)), userId, summaryDate]
    );
    await this.addExp(userId, exp, 'Hoàn thành bài test mini', 'test', null, date, executor);
  }
};

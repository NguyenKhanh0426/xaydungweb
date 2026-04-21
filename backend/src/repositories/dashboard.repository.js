import { pool } from '../config/db.js';

export const dashboardRepository = {
  async getOverview(userId) {
    const [[profile]] = await pool.query(
      `SELECT hs.ho_ten AS full_name, tk.tong_exp AS total_exp, tk.chuoi_hien_tai AS current_streak
       FROM ho_so_nguoi_dung hs
       LEFT JOIN thong_ke_nguoi_dung tk ON tk.nguoi_dung_id = hs.nguoi_dung_id
       WHERE hs.nguoi_dung_id = ?`,
      [userId]
    );

    const [[due]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM trang_thai_hoc_the
       WHERE nguoi_dung_id = ? AND on_tiep_theo_luc <= NOW()`,
      [userId]
    );

    const [recentTests] = await pool.query(
      `SELECT llb.id, bkt.tieu_de AS title, bkt.loai_bai_kiem_tra AS test_type,
              llb.diem_phan_tram AS percentage_score, llb.tao_luc AS created_at
       FROM lan_lam_bai llb
       INNER JOIN bai_kiem_tra bkt ON bkt.id = llb.bai_kiem_tra_id
       WHERE llb.nguoi_dung_id = ?
       ORDER BY llb.tao_luc DESC
       LIMIT 5`,
      [userId]
    );

    const [weekly] = await pool.query(
      `SELECT ngay_tong_hop AS summary_date, total_minutes, exp_nhan_duoc AS exp_gained
        FROM tong_hop_hoc_tap_hang_ngay
       WHERE nguoi_dung_id = ?
         AND ngay_tong_hop >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       ORDER BY ngay_tong_hop ASC`,
      [userId]
    );

    const [skillRows] = await pool.query(
      `SELECT loai_ky_nang AS skill_type,
              ROUND(AVG(COALESCE(diem_so, LEAST(100, phut_hoc * 5))), 0) AS score
       FROM nhat_ky_ky_nang
       WHERE nguoi_dung_id = ?
         AND hoc_luc >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY loai_ky_nang`,
      [userId]
    );

    return {
      profile: profile || { full_name: 'Learner', total_exp: 0, current_streak: 0 },
      dueFlashcards: due?.total || 0,
      recentTests,
      weekly,
      skillRows
    };
  }
};

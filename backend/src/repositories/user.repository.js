import { pool } from '../config/db.js';

export const userRepository = {
  async findByEmail(email, executor = pool) {
    const [rows] = await executor.query('SELECT * FROM nguoi_dung WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async createUser({ email, passwordHash }, executor = pool) {
    const [result] = await executor.query(
      'INSERT INTO nguoi_dung (email, mat_khau_ma_hoa) VALUES (?, ?)',
      [email, passwordHash]
    );
    return result.insertId;
  },

  async createProfile({ userId, fullName }, executor = pool) {
    await executor.query(
      'INSERT INTO ho_so_nguoi_dung (nguoi_dung_id, ho_ten, mui_gio) VALUES (?, ?, ?)',
      [userId, fullName, 'Asia/Ho_Chi_Minh']
    );
  },

  async createStats(userId, executor = pool) {
    await executor.query('INSERT INTO thong_ke_nguoi_dung (nguoi_dung_id) VALUES (?)', [userId]);
  },

  async findProfileByUserId(userId, executor = pool) {
    const [rows] = await executor.query(
      `SELECT nd.id, nd.email, nd.vai_tro AS role, hs.ho_ten AS full_name,
              hs.trinh_do_tieng_anh AS english_level, hs.ky_thi_muc_tieu AS target_exam,
              hs.gioi_thieu AS bio, tk.tong_exp AS total_exp,
              tk.chuoi_hien_tai AS current_streak, tk.chuoi_dai_nhat AS longest_streak
       FROM nguoi_dung nd
       LEFT JOIN ho_so_nguoi_dung hs ON hs.nguoi_dung_id = nd.id
       LEFT JOIN thong_ke_nguoi_dung tk ON tk.nguoi_dung_id = nd.id
       WHERE nd.id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async updateProfile(userId, payload, executor = pool) {
    const { fullName, englishLevel, targetExam, bio } = payload;
    await executor.query(
      `UPDATE ho_so_nguoi_dung
       SET ho_ten = ?, trinh_do_tieng_anh = ?, ky_thi_muc_tieu = ?, gioi_thieu = ?
       WHERE nguoi_dung_id = ?`,
      [fullName, englishLevel, targetExam, bio, userId]
    );
    return this.findProfileByUserId(userId, executor);
  }
};

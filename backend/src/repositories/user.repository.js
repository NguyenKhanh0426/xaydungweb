import { pool } from '../config/db.js';

export const userRepository = {
  async findByEmail(email, executor = pool) {
    const [rows] = await executor.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async createUser({ email, passwordHash }, executor = pool) {
    const [result] = await executor.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    return result.insertId;
  },

  async createProfile({ userId, fullName }, executor = pool) {
    await executor.query(
      'INSERT INTO user_profiles (user_id, full_name, timezone) VALUES (?, ?, ?)',
      [userId, fullName, 'Asia/Ho_Chi_Minh']
    );
  },

  async createStats(userId, executor = pool) {
    await executor.query('INSERT INTO user_stats (user_id) VALUES (?)', [userId]);
  },

  async findProfileByUserId(userId, executor = pool) {
    const [rows] = await executor.query(
      `SELECT u.id, u.email, u.role, up.full_name, up.english_level, up.target_exam, up.bio,
              us.total_exp, us.current_streak, us.longest_streak
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_stats us ON us.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async updateProfile(userId, payload, executor = pool) {
    const { fullName, englishLevel, targetExam, bio } = payload;
    await executor.query(
      `UPDATE user_profiles
       SET full_name = ?, english_level = ?, target_exam = ?, bio = ?
       WHERE user_id = ?`,
      [fullName, englishLevel, targetExam, bio, userId]
    );
    return this.findProfileByUserId(userId, executor);
  }
};

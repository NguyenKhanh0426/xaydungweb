import { pool } from '../config/db.js';

export const goalRepository = {
  async getGoals(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM user_goals WHERE user_id = ? ORDER BY status = 'active' DESC, created_at DESC`,
      [userId]
    );
    return rows;
  },

  async createGoal(userId, payload) {
    const { goalType, targetValue = null, targetUnit = null, startDate, targetDate = null, description = null } = payload;
    const [result] = await pool.query(
      `INSERT INTO user_goals (user_id, goal_type, target_value, target_unit, start_date, target_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, goalType, targetValue, targetUnit, startDate, targetDate, description]
    );
    const [rows] = await pool.query(`SELECT * FROM user_goals WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
};

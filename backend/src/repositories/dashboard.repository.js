import { pool } from '../config/db.js';

export const dashboardRepository = {
  async getOverview(userId) {
    const [[profile]] = await pool.query(
      `SELECT up.full_name, us.total_exp, us.current_streak
       FROM user_profiles up
       LEFT JOIN user_stats us ON us.user_id = up.user_id
       WHERE up.user_id = ?`,
      [userId]
    );

    const [[due]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM flashcard_learning_state
       WHERE user_id = ? AND next_review_at <= NOW()`,
      [userId]
    );

    const [recentTests] = await pool.query(
      `SELECT ta.id, t.title, ta.percentage_score, ta.created_at
       FROM test_attempts ta
       INNER JOIN tests t ON t.id = ta.test_id
       WHERE ta.user_id = ?
       ORDER BY ta.created_at DESC
       LIMIT 5`,
      [userId]
    );

    const [weekly] = await pool.query(
      `SELECT summary_date, total_minutes, exp_gained
       FROM daily_study_summary
       WHERE user_id = ?
         AND summary_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       ORDER BY summary_date ASC`,
      [userId]
    );

    return {
      profile: profile || { full_name: 'Learner', total_exp: 0, current_streak: 0 },
      dueFlashcards: due?.total || 0,
      recentTests,
      weekly
    };
  }
};

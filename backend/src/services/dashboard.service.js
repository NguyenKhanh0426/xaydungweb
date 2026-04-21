import { dashboardRepository } from '../repositories/dashboard.repository.js';

export const dashboardService = {
  async getOverview(userId) {
    const raw = await dashboardRepository.getOverview(userId);
    const skillDefaults = { listening: 0, speaking: 0, reading: 0, writing: 0 };
    for (const row of raw.skillRows || []) {
      skillDefaults[row.skill_type] = Number(row.score || 0);
    }

    return {
      user: {
        fullName: raw.profile.full_name,
        totalExp: raw.profile.total_exp || 0,
        currentStreak: raw.profile.current_streak || 0
      },
      todayDueFlashcards: raw.dueFlashcards,
      weeklyStudyMinutes: raw.weekly.map((item) => Number(item.total_minutes || 0)),
      weeklyExp: raw.weekly.map((item) => Number(item.exp_gained || 0)),
      recentTests: raw.recentTests,
      skillStats: skillDefaults
    };
  }
};

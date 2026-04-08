import { dashboardRepository } from '../repositories/dashboard.repository.js';

export const dashboardService = {
  async getOverview(userId) {
    const raw = await dashboardRepository.getOverview(userId);
    return {
      user: {
        fullName: raw.profile.full_name,
        totalExp: raw.profile.total_exp || 0,
        currentStreak: raw.profile.current_streak || 0
      },
      todayDueFlashcards: raw.dueFlashcards,
      weeklyStudyMinutes: raw.weekly.map((item) => item.total_minutes),
      weeklyExp: raw.weekly.map((item) => item.exp_gained),
      recentTests: raw.recentTests
    };
  }
};

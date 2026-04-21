import { ApiError } from '../utils/ApiError.js';
import { goalRepository } from '../repositories/goal.repository.js';

export const goalService = {
  async getGoals(userId, status) {
    return goalRepository.getGoals(userId, status);
  },
  async createGoal(userId, payload) {
    return goalRepository.createGoal(userId, payload);
  },
  async updateGoal(userId, goalId, payload) {
    const goal = await goalRepository.updateGoal(userId, goalId, payload);
    if (!goal) {
      throw new ApiError(404, 'Goal not found');
    }
    return goal;
  }
};

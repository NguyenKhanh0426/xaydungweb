import { goalRepository } from '../repositories/goal.repository.js';

export const goalService = {
  async getGoals(userId) {
    return goalRepository.getGoals(userId);
  },
  async createGoal(userId, payload) {
    return goalRepository.createGoal(userId, payload);
  }
};

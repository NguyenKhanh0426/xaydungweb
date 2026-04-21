import { userRepository } from '../repositories/user.repository.js';

export const userService = {
  async getMe(userId) {
    return userRepository.findProfileByUserId(userId);
  },

  async updateMe(userId, payload) {
    return userRepository.updateProfile(userId, payload);
  }
};

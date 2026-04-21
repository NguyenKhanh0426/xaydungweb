import { ApiError } from '../utils/ApiError.js';
import { reminderRepository } from '../repositories/reminder.repository.js';

export const reminderService = {
  async getReminders(userId) {
    return reminderRepository.getReminders(userId);
  },

  async createReminder(userId, payload) {
    return reminderRepository.createReminder(userId, payload);
  },

  async updateReminder(userId, reminderId, payload) {
    const reminder = await reminderRepository.updateReminder(userId, reminderId, payload);
    if (!reminder) {
      throw new ApiError(404, 'Study reminder not found');
    }
    return reminder;
  },

  async deleteReminder(userId, reminderId) {
    const deleted = await reminderRepository.deleteReminder(userId, reminderId);
    if (!deleted) {
      throw new ApiError(404, 'Study reminder not found');
    }
    return { success: true };
  }
};

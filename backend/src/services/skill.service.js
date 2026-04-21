import { ApiError } from '../utils/ApiError.js';
import { skillRepository } from '../repositories/skill.repository.js';

export const skillService = {
  async createSkillLog(userId, payload) {
    return skillRepository.createSkillLog(userId, payload);
  },

  async getSkillLogs(userId, filters) {
    const logs = await skillRepository.getSkillLogs(userId, filters);
    const summary = logs.reduce((acc, item) => {
      acc.totalMinutes += Number(item.studyMinutes || 0);
      acc.totalRecords += 1;
      acc.bySkill[item.skillType] = (acc.bySkill[item.skillType] || 0) + 1;
      return acc;
    }, { totalMinutes: 0, totalRecords: 0, bySkill: { listening: 0, speaking: 0, reading: 0, writing: 0 } });

    return { logs, summary };
  },

  async deleteSkillLog(userId, skillLogId) {
    const deleted = await skillRepository.deleteSkillLog(userId, skillLogId);
    if (!deleted) {
      throw new ApiError(404, 'Skill log not found');
    }
    return { success: true };
  }
};

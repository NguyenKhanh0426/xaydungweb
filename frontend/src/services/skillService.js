import axiosClient from './axiosClient';

export const skillService = {
  async getSkillLogs(skillType = '') {
    const { data } = await axiosClient.get('/skill-logs', { params: skillType ? { skillType } : {} });
    return data.data;
  },
  async createSkillLog(payload) {
    const { data } = await axiosClient.post('/skill-logs', payload);
    return data.data;
  },
  async deleteSkillLog(id) {
    const { data } = await axiosClient.delete(`/skill-logs/${id}`);
    return data.data;
  }
};

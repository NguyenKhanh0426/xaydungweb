import axiosClient from './axiosClient';

export const goalService = {
  async getGoals(status = 'all') {
    const { data } = await axiosClient.get('/users/goals', { params: { status } });
    return data.data;
  },
  async createGoal(payload) {
    const { data } = await axiosClient.post('/users/goals', payload);
    return data.data;
  },
  async updateGoal(goalId, payload) {
    const { data } = await axiosClient.put(`/users/goals/${goalId}`, payload);
    return data.data;
  }
};

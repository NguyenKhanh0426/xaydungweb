import axiosClient from './axiosClient';

export const goalService = {
  async getGoals() {
    const { data } = await axiosClient.get('/users/goals');
    return data.data;
  },
  async createGoal(payload) {
    const { data } = await axiosClient.post('/users/goals', payload);
    return data.data;
  }
};

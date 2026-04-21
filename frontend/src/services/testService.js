import axiosClient from './axiosClient';

export const testService = {
  async getRecentAttempts() {
    const { data } = await axiosClient.get('/mini-tests/recent');
    return data.data;
  },
  async getAttemptHistory(params = {}) {
    const { data } = await axiosClient.get('/mini-tests/history', { params });
    return data.data;
  },
  async generateMiniTest(payload) {
    const { data } = await axiosClient.post('/mini-tests/generate', payload);
    return data.data;
  },
  async submitMiniTest(attemptId, payload) {
    const { data } = await axiosClient.post(`/mini-tests/${attemptId}/submit`, payload);
    return data.data;
  }
};

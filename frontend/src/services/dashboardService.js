import axiosClient from './axiosClient';

export const dashboardService = {
  async getOverview() {
    const { data } = await axiosClient.get('/dashboard/overview');
    return data.data;
  }
};

import axiosClient from './axiosClient';

export const userService = {
  async getMe() {
    const { data } = await axiosClient.get('/users/me');
    return data.data;
  },
  async updateMe(payload) {
    const { data } = await axiosClient.put('/users/me', payload);
    return data.data;
  }
};

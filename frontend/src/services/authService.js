import axiosClient from './axiosClient';

export const authService = {
  async login(payload) {
    const { data } = await axiosClient.post('/auth/login', payload);
    return data.data;
  },
  async register(payload) {
    const { data } = await axiosClient.post('/auth/register', payload);
    return data.data;
  }
};

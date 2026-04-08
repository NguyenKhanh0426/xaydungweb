import axiosClient from './axiosClient';

export const aiService = {
  async askAssistant(payload) {
    const { data } = await axiosClient.post('/ai/assistant', payload);
    return data.data;
  }
};

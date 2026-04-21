import axiosClient from './axiosClient';

export const flashcardService = {
  async getDueCards() {
    const { data } = await axiosClient.get('/flashcards/due');
    return data.data;
  },
  async review(flashcardId, payload) {
    const { data } = await axiosClient.post(`/flashcards/${flashcardId}/review`, payload);
    return data.data;
  },
  async createFlashcard(payload) {
    const { data } = await axiosClient.post('/flashcards', payload);
    return data.data;
  }
};

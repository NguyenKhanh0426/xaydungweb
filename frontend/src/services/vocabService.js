import axiosClient from './axiosClient';

export const vocabService = {
  async getSets() {
    const { data } = await axiosClient.get('/vocab-sets');
    return data.data;
  },
  async createSet(payload) {
    const { data } = await axiosClient.post('/vocab-sets', payload);
    return data.data;
  },
  async getVocabularies(setId) {
    const { data } = await axiosClient.get(`/vocab-sets/${setId}/vocabularies`);
    return data.data;
  },
  async addVocabulary(setId, payload) {
    const { data } = await axiosClient.post(`/vocab-sets/${setId}/vocabularies`, payload);
    return data.data;
  }
};

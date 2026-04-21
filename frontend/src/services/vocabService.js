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
  async updateSet(setId, payload) {
    const { data } = await axiosClient.put(`/vocab-sets/${setId}`, payload);
    return data.data;
  },
  async deleteSet(setId) {
    const { data } = await axiosClient.delete(`/vocab-sets/${setId}`);
    return data.data;
  },
  async getVocabularies(setId, params = {}) {
    const { data } = await axiosClient.get(`/vocab-sets/${setId}/vocabularies`, { params });
    return data.data;
  },
  async addVocabulary(setId, payload) {
    const { data } = await axiosClient.post(`/vocab-sets/${setId}/vocabularies`, payload);
    return data.data;
  },
  async updateVocabulary(vocabularyId, payload) {
    const { data } = await axiosClient.put(`/vocabularies/${vocabularyId}`, payload);
    return data.data;
  },
  async deleteVocabulary(vocabularyId) {
    const { data } = await axiosClient.delete(`/vocabularies/${vocabularyId}`);
    return data.data;
  }
};

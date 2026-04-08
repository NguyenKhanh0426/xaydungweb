import { vocabRepository } from '../repositories/vocab.repository.js';

export const vocabService = {
  async createSet(userId, payload) {
    const id = await vocabRepository.createSet(userId, payload);
    return { id };
  },

  async getSets(userId) {
    return vocabRepository.getSets(userId);
  },

  async addVocabulary(setId, payload) {
    const id = await vocabRepository.addVocabulary(setId, payload);
    return { id };
  },

  async getVocabulariesBySet(userId, setId) {
    return vocabRepository.getVocabulariesBySetId(setId, userId);
  }
};

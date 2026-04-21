import { ApiError } from '../utils/ApiError.js';
import { vocabRepository } from '../repositories/vocab.repository.js';

export const vocabService = {
  async createSet(userId, payload) {
    return vocabRepository.createSet(userId, payload);
  },
  async getSets(userId) {
    return vocabRepository.getSets(userId);
  },
  async updateSet(userId, setId, payload) {
    const setInfo = await vocabRepository.updateSet(setId, userId, payload);
    if (!setInfo) {
      throw new ApiError(404, 'Vocabulary set not found');
    }
    return setInfo;
  },
  async deleteSet(userId, setId) {
    const deleted = await vocabRepository.deleteSet(setId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Vocabulary set not found');
    }
    return { success: true };
  },
  async addVocabulary(userId, setId, payload) {
    const setInfo = await vocabRepository.findSetById(setId, userId);
    if (!setInfo) {
      throw new ApiError(404, 'Vocabulary set not found');
    }
    return vocabRepository.addVocabulary(setId, payload);
  },
  async updateVocabulary(userId, vocabularyId, payload) {
    const vocabulary = await vocabRepository.updateVocabulary(vocabularyId, userId, payload);
    if (!vocabulary) {
      throw new ApiError(404, 'Vocabulary not found');
    }
    return vocabulary;
  },
  async deleteVocabulary(userId, vocabularyId) {
    const deleted = await vocabRepository.deleteVocabulary(vocabularyId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Vocabulary not found');
    }
    return { success: true };
  },
  async getVocabulariesBySet(userId, setId, filters) {
    const setInfo = await vocabRepository.findSetById(setId, userId);
    if (!setInfo) {
      throw new ApiError(404, 'Vocabulary set not found');
    }
    return vocabRepository.getVocabulariesBySetId(setId, userId, filters);
  }
};

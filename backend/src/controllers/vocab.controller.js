import { ok } from '../utils/apiResponse.js';
import { vocabService } from '../services/vocab.service.js';

export const vocabController = {
  createSet: async (req, res) => {
    const data = await vocabService.createSet(req.user.id, req.body);
    return ok(res, data, 'Vocabulary set created', 201);
  },

  getSets: async (req, res) => {
    const data = await vocabService.getSets(req.user.id);
    return ok(res, data, 'Vocabulary sets fetched');
  },

  addVocabulary: async (req, res) => {
    const data = await vocabService.addVocabulary(Number(req.params.setId), req.body);
    return ok(res, data, 'Vocabulary added', 201);
  },

  getVocabulariesBySet: async (req, res) => {
    const data = await vocabService.getVocabulariesBySet(req.user.id, Number(req.params.setId));
    return ok(res, data, 'Vocabularies fetched');
  }
};

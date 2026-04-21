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

  updateSet: async (req, res) => {
    const data = await vocabService.updateSet(req.user.id, Number(req.params.setId), req.body);
    return ok(res, data, 'Vocabulary set updated');
  },

  deleteSet: async (req, res) => {
    const data = await vocabService.deleteSet(req.user.id, Number(req.params.setId));
    return ok(res, data, 'Vocabulary set deleted');
  },

  addVocabulary: async (req, res) => {
    const data = await vocabService.addVocabulary(req.user.id, Number(req.params.setId), req.body);
    return ok(res, data, 'Vocabulary added', 201);
  },

  updateVocabulary: async (req, res) => {
    const data = await vocabService.updateVocabulary(req.user.id, Number(req.params.vocabularyId), req.body);
    return ok(res, data, 'Vocabulary updated');
  },

  deleteVocabulary: async (req, res) => {
    const data = await vocabService.deleteVocabulary(req.user.id, Number(req.params.vocabularyId));
    return ok(res, data, 'Vocabulary deleted');
  },

  getVocabulariesBySet: async (req, res) => {
    const data = await vocabService.getVocabulariesBySet(req.user.id, Number(req.params.setId), {
      search: req.query.search || '',
      partOfSpeech: req.query.partOfSpeech || ''
    });
    return ok(res, data, 'Vocabularies fetched');
  }
};

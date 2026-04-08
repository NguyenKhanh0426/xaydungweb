import { ok } from '../utils/apiResponse.js';
import { flashcardService } from '../services/flashcard.service.js';

export const flashcardController = {
  create: async (req, res) => {
    const data = await flashcardService.createFlashcard(req.user.id, req.body.vocabularyId);
    return ok(res, data, 'Flashcard created', 201);
  },

  due: async (req, res) => {
    const data = await flashcardService.getDueCards(req.user.id);
    return ok(res, data, 'Due flashcards fetched');
  },

  review: async (req, res) => {
    const data = await flashcardService.review(req.user.id, Number(req.params.id), req.body);
    return ok(res, data, 'Flashcard reviewed');
  }
};

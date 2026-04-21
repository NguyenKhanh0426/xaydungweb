import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { vocabController } from '../controllers/vocab.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addVocabularySchema, createSetSchema } from '../validators/vocab.validator.js';

const router = Router();

router.post('/vocab-sets', authMiddleware, validate(createSetSchema), asyncHandler(vocabController.createSet));
router.get('/vocab-sets', authMiddleware, asyncHandler(vocabController.getSets));
router.put('/vocab-sets/:setId', authMiddleware, validate(createSetSchema), asyncHandler(vocabController.updateSet));
router.delete('/vocab-sets/:setId', authMiddleware, asyncHandler(vocabController.deleteSet));
router.get('/vocab-sets/:setId/vocabularies', authMiddleware, asyncHandler(vocabController.getVocabulariesBySet));
router.post('/vocab-sets/:setId/vocabularies', authMiddleware, validate(addVocabularySchema), asyncHandler(vocabController.addVocabulary));
router.put('/vocabularies/:vocabularyId', authMiddleware, validate(addVocabularySchema), asyncHandler(vocabController.updateVocabulary));
router.delete('/vocabularies/:vocabularyId', authMiddleware, asyncHandler(vocabController.deleteVocabulary));

export default router;

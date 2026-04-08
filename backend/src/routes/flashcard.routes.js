import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { flashcardController } from '../controllers/flashcard.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { reviewFlashcardSchema } from '../validators/flashcard.validator.js';

const router = Router();

router.post('/flashcards', authMiddleware, asyncHandler(flashcardController.create));
router.get('/flashcards/due', authMiddleware, asyncHandler(flashcardController.due));
router.post('/flashcards/:id/review', authMiddleware, validate(reviewFlashcardSchema), asyncHandler(flashcardController.review));

export default router;

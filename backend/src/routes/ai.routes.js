import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { aiController } from '../controllers/ai.controller.js';
import { assistantSchema } from '../validators/ai.validator.js';

const router = Router();

router.post('/ai/assistant', authMiddleware, validate(assistantSchema), asyncHandler(aiController.assistant));

export default router;

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { testController } from '../controllers/test.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generateMiniTestSchema, submitMiniTestSchema } from '../validators/test.validator.js';

const router = Router();

router.get('/mini-tests/recent', authMiddleware, asyncHandler(testController.recent));
router.get('/mini-tests/history', authMiddleware, asyncHandler(testController.history));
router.post('/mini-tests/generate', authMiddleware, validate(generateMiniTestSchema), asyncHandler(testController.generate));
router.post('/mini-tests/:attemptId/submit', authMiddleware, validate(submitMiniTestSchema), asyncHandler(testController.submit));

export default router;

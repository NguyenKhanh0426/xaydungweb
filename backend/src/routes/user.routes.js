import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGoalSchema, updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.get('/me', authMiddleware, asyncHandler(userController.me));
router.put('/me', authMiddleware, validate(updateProfileSchema), asyncHandler(userController.updateMe));
router.get('/goals', authMiddleware, asyncHandler(userController.getGoals));
router.post('/goals', authMiddleware, validate(createGoalSchema), asyncHandler(userController.createGoal));

export default router;

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { skillController } from '../controllers/skill.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { skillLogSchema } from '../validators/skill.validator.js';

const router = Router();

router.get('/skill-logs', authMiddleware, asyncHandler(skillController.getAll));
router.post('/skill-logs', authMiddleware, validate(skillLogSchema), asyncHandler(skillController.create));
router.delete('/skill-logs/:id', authMiddleware, asyncHandler(skillController.delete));

export default router;

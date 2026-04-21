import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { reminderController } from '../controllers/reminder.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { reminderSchema } from '../validators/reminder.validator.js';

const router = Router();

router.get('/study-reminders', authMiddleware, asyncHandler(reminderController.getAll));
router.post('/study-reminders', authMiddleware, validate(reminderSchema), asyncHandler(reminderController.create));
router.put('/study-reminders/:id', authMiddleware, validate(reminderSchema), asyncHandler(reminderController.update));
router.delete('/study-reminders/:id', authMiddleware, asyncHandler(reminderController.delete));

export default router;

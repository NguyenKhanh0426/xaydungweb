import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh-token', asyncHandler(authController.refreshToken));

export default router;

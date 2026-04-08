import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/dashboard/overview', authMiddleware, asyncHandler(dashboardController.overview));
export default router;

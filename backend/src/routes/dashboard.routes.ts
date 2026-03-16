import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard/stats', authenticate, authorizeAdmin, getDashboardStats);

export default router;

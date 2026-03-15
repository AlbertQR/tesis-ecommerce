import { Router } from 'express';
import { uploadImage, uploadMiddleware } from '../controllers/upload.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/upload', authenticate, authorizeAdmin, uploadMiddleware, uploadImage);

export default router;

import { Router } from 'express';
import {
  getLegalDocuments,
  getLegalDocumentByType,
  getAllLegalDocuments,
  createLegalDocument,
  updateLegalDocument,
  deleteLegalDocument
} from '../controllers/legal.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/legal', getLegalDocuments);
router.get('/legal/:type', getLegalDocumentByType);

router.get('/admin/legal', authenticate, authorizeAdmin, getAllLegalDocuments);
router.post('/admin/legal', authenticate, authorizeAdmin, createLegalDocument);
router.put('/admin/legal/:type', authenticate, authorizeAdmin, updateLegalDocument);
router.delete('/admin/legal/:type', authenticate, authorizeAdmin, deleteLegalDocument);

export default router;

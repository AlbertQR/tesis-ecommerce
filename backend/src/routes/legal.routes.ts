import { Router } from 'express';
import {
  createLegalDocument,
  deleteLegalDocument,
  getAllLegalDocuments,
  getLegalDocumentByType,
  getLegalDocuments,
  updateLegalDocument
} from '../controllers/legal.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/legal', getLegalDocuments);
router.get('/legal/:type', getLegalDocumentByType);

router.route('/admin/legal')
  .get(authenticate, authorizeAdmin, getAllLegalDocuments)
  .post(authenticate, authorizeAdmin, createLegalDocument);

router.route('/admin/legal/:type')
  .put(authenticate, authorizeAdmin, updateLegalDocument)
  .delete(authenticate, authorizeAdmin, deleteLegalDocument);

export default router;

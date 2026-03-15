import { Router } from 'express';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
  getContents,
  getContentByKey,
  createContent,
  updateContent,
  deleteContent
} from '../controllers/content.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/testimonials', getTestimonials);
router.get('/combos', getCombos);
router.get('/combos/:id', getComboById);
router.get('/contents', getContents);
router.get('/contents/:key', getContentByKey);

router.post('/testimonials', authenticate, authorizeAdmin, createTestimonial);
router.put('/testimonials/:id', authenticate, authorizeAdmin, updateTestimonial);
router.delete('/testimonials/:id', authenticate, authorizeAdmin, deleteTestimonial);

router.post('/combos', authenticate, authorizeAdmin, createCombo);
router.put('/combos/:id', authenticate, authorizeAdmin, updateCombo);
router.delete('/combos/:id', authenticate, authorizeAdmin, deleteCombo);

router.post('/contents', authenticate, authorizeAdmin, createContent);
router.put('/contents/:key', authenticate, authorizeAdmin, updateContent);
router.delete('/contents/:key', authenticate, authorizeAdmin, deleteContent);

export default router;

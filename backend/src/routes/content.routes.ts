import { Router } from 'express';
import {
  createCombo,
  createContent,
  createTestimonial,
  deleteCombo,
  deleteContent,
  deleteTestimonial,
  getComboById,
  getCombos,
  getContentByKey,
  getContents,
  getTestimonials,
  updateCombo,
  updateContent,
  updateTestimonial
} from '../controllers/content.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.route('/testimonials')
  .get(getTestimonials)
  .post(authenticate, authorizeAdmin, createTestimonial);

router.route('/testimonials/:id')
  .put(authenticate, authorizeAdmin, updateTestimonial)
  .delete(authenticate, authorizeAdmin, deleteTestimonial);

router.route('/combos')
  .get(getCombos)
  .post(authenticate, authorizeAdmin, createCombo);

router.route('/combos/:id')
  .get(getComboById)
  .put(authenticate, authorizeAdmin, updateCombo)
  .delete(authenticate, authorizeAdmin, deleteCombo);

router.route('/contents')
  .get(getContents)
  .post(authenticate, authorizeAdmin, createContent);

router.route('/contents/:key')
  .get(getContentByKey)
  .put(authenticate, authorizeAdmin, updateContent)
  .delete(authenticate, authorizeAdmin, deleteContent);

export default router;

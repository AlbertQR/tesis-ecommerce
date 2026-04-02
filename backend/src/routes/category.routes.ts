import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from '../controllers/product.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(getCategories)
  .post(authenticate, authorizeAdmin, createCategory);

router.route('/:id')
  .put(authenticate, authorizeAdmin, updateCategory)
  .delete(authenticate, authorizeAdmin, deleteCategory);

export default router;

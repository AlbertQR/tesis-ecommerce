import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/product.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(getProducts)
  .post(authenticate, authorizeAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authenticate, authorizeAdmin, updateProduct)
  .delete(authenticate, authorizeAdmin, deleteProduct);

export default router;

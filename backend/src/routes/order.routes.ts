import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  downloadInvoice
} from '../controllers/order.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.put('/cart/:productId', authenticate, updateCartItem);
router.delete('/cart', authenticate, clearCart);
router.delete('/cart/:productId', authenticate, removeFromCart);

router.post('/checkout', authenticate, checkout);

router.get('/orders', authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrderById);
router.get('/orders/:id/invoice', authenticate, downloadInvoice);

router.get('/admin/orders', authenticate, authorizeAdmin, getAllOrders);
router.put('/admin/orders/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;

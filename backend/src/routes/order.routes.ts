import { Router } from 'express';
import {
  addToCart,
  cancelOrder,
  checkout,
  clearCart,
  downloadInvoice,
  getAllOrders,
  getCart,
  getOrderById,
  getOrders,
  removeFromCart,
  updateCartItem,
  updateOrderStatus,
  updateDeliveryPerson,
  verifyOrderByQR
} from '../controllers/order.controller.js';
import { authenticate, authorizeStaff } from '../middleware/auth.js';

const router = Router();

router.route('/cart')
  .get(authenticate, getCart)
  .post(authenticate, addToCart)
  .delete(authenticate, clearCart);

router.route('/cart/:productId')
  .put(authenticate, updateCartItem)
  .delete(authenticate, removeFromCart);

router.post('/checkout', authenticate, checkout);

router.get('/orders', authenticate, getOrders);

router.route('/orders/:id')
  .get(authenticate, getOrderById)
  .delete(authenticate, cancelOrder);

router.get('/orders/:id/invoice', authenticate, downloadInvoice);

router.post('/verify-qr', verifyOrderByQR);

router.get('/admin/orders', authenticate, authorizeStaff, getAllOrders);
router.put('/admin/orders/:id/status', authenticate, authorizeStaff, updateOrderStatus);
router.put('/admin/orders/:id/delivery', authenticate, authorizeStaff, updateDeliveryPerson);

export default router;

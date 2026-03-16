import { Router } from 'express';
import { 
  createPayment, 
  paymentCallback, 
  paymentCancel,
  refundPayment,
  getPaymentSettings,
  updatePaymentSettings 
} from '../controllers/payment.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/payments', authenticate, createPayment);
router.get('/payments/callback', paymentCallback);
router.get('/payments/cancel', paymentCancel);
router.post('/payments/refund', authenticate, authorizeAdmin, refundPayment);
router.get('/payments/settings', authenticate, authorizeAdmin, getPaymentSettings);
router.put('/payments/settings', authenticate, authorizeAdmin, updatePaymentSettings);

export default router;

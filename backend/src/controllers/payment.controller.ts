import { Response } from 'express';
import { Settings, User } from '../models/index.js';
import { EnZonaService, EnZonaPaymentRequest } from '../services/enzona.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { Order } from '../models/index.js';

interface PaymentQuery {
  orderId: string;
}

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { orderId } = req.body as PaymentQuery;

    const order = await Order.findOne({ orderId, userId: userId as unknown as import('mongoose').Types.ObjectId });
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    if (order.paymentStatus === 'paid') {
      res.status(400).json({ error: 'El pedido ya está pagado' });
      return;
    }

    const consumerKey = await Settings.findOne({ key: 'enzona_consumer_key' });
    const consumerSecret = await Settings.findOne({ key: 'enzona_consumer_secret' });
    const merchantUuid = await Settings.findOne({ key: 'enzona_merchant_uuid' });

    if (!consumerKey?.value || !consumerSecret?.value || !merchantUuid?.value) {
      res.status(500).json({ error: 'Configuración de pago no disponible' });
      return;
    }

    const enzona = new EnZonaService(
      consumerKey.value,
      consumerSecret.value,
      merchantUuid.value
    );

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const paymentRequest: EnZonaPaymentRequest = {
      orderId: order.orderId,
      total: order.total,
      shipping: order.shipping,
      items: order.items.map(item => ({
        name: item.productName,
        description: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        tax: 0
      })),
      returnUrl: `${baseUrl}/api/payments/callback?orderId=${order.orderId}`,
      cancelUrl: `${baseUrl}/api/payments/cancel?orderId=${order.orderId}`
    };

    const payment = await enzona.createPayment(paymentRequest);

    await Order.findByIdAndUpdate(order._id, {
      transactionUuid: payment.transactionUuid,
      paymentConfirmUrl: payment.confirmUrl,
      paymentCompleteUrl: payment.completeUrl
    });

    res.json({
      transactionUuid: payment.transactionUuid,
      confirmUrl: payment.confirmUrl,
      completeUrl: payment.completeUrl,
      cancelUrl: payment.cancelUrl
    });
  } catch (error) {
    console.error('CreatePayment error:', error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
};

export const paymentCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, transaction_uuid, status } = req.query;

    if (!orderId || !transaction_uuid) {
      res.redirect(`/pedido/${orderId}?payment=cancelled`);
      return;
    }

    const order = await Order.findOne({ orderId: orderId as string });
    if (!order) {
      res.redirect('/?payment=error');
      return;
    }

    const consumerKey = await Settings.findOne({ key: 'enzona_consumer_key' });
    const consumerSecret = await Settings.findOne({ key: 'enzona_consumer_secret' });
    const merchantUuid = await Settings.findOne({ key: 'enzona_merchant_uuid' });

    if (!consumerKey?.value || !consumerSecret?.value || !merchantUuid?.value) {
      res.redirect(`/pedido/${orderId}?payment=error`);
      return;
    }

    const enzona = new EnZonaService(
      consumerKey.value,
      consumerSecret.value,
      merchantUuid.value
    );

    const paymentStatus = await enzona.getPaymentStatus(transaction_uuid as string);

    if (paymentStatus.status === 'PAID') {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'paid',
        status: 'confirmed'
      });
      // Clear cart after successful payment
      await User.findByIdAndUpdate(order.userId, { cart: [], cartExpiresAt: undefined });
      res.redirect(`/pedido/${orderId}?payment=success`);
    } else if (paymentStatus.status === 'CANCELLED' || paymentStatus.status === 'DECLINED') {
      res.redirect(`/pedido/${orderId}?payment=cancelled`);
    } else {
      res.redirect(`/pedido/${orderId}?payment=pending`);
    }
  } catch (error) {
    console.error('PaymentCallback error:', error);
    res.redirect(`/${req.query.orderId}?payment=error`);
  }
};

export const paymentCancel = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId } = req.query;
  res.redirect(`/pedido/${orderId}?payment=cancelled`);
};

export const refundPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body as { orderId: string };

    const order = await Order.findOne({ orderId });
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    if (order.paymentStatus !== 'paid') {
      res.status(400).json({ error: 'El pedido no ha sido pagado' });
      return;
    }

    if (!order.transactionUuid) {
      res.status(400).json({ error: 'No se encontró la transacción de pago' });
      return;
    }

    const refundEnabled = await Settings.findOne({ key: 'refund_enabled' });
    const refundPercentage = await Settings.findOne({ key: 'refund_percentage' });

    if (refundEnabled?.value !== 'true') {
      res.status(400).json({ error: 'Los reembolsos están deshabilitados' });
      return;
    }

    const percentage = parseFloat(refundPercentage?.value || '80');
    const refundAmount = Math.round(order.total * (percentage / 100));

    const consumerKey = await Settings.findOne({ key: 'enzona_consumer_key' });
    const consumerSecret = await Settings.findOne({ key: 'enzona_consumer_secret' });
    const merchantUuid = await Settings.findOne({ key: 'enzona_merchant_uuid' });

    if (!consumerKey?.value || !consumerSecret?.value || !merchantUuid?.value) {
      res.status(500).json({ error: 'Configuración de pago no disponible' });
      return;
    }

    const enzona = new EnZonaService(
      consumerKey.value,
      consumerSecret.value,
      merchantUuid.value
    );

    const result = await enzona.refundPayment({
      transactionUuid: order.transactionUuid,
      amount: refundAmount,
      description: `Reembolso pedido ${orderId} - ${percentage}%`
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'refunded',
      refundAmount: refundAmount,
      refundPercentage: percentage,
      refundTransactionUuid: result.transactionUuid,
      status: 'cancelled'
    });

    res.json({
      success: true,
      refundAmount,
      percentage,
      transactionUuid: result.transactionUuid
    });
  } catch (error) {
    console.error('RefundPayment error:', error);
    res.status(500).json({ error: 'Error al procesar el reembolso' });
  }
};

export const getPaymentSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await Settings.find({ key: { $in: [
      'enzona_consumer_key',
      'enzona_consumer_secret', 
      'enzona_merchant_uuid',
      'refund_percentage',
      'refund_enabled'
    ]}});

    const result: Record<string, string> = {};
    for (const s of settings) {
      if (s.key === 'enzona_consumer_key' || s.key === 'enzona_consumer_secret') {
        result[s.key] = s.value ? '***CONFIGURADO***' : '';
      } else {
        result[s.key] = s.value;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('GetPaymentSettings error:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

export const updatePaymentSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      enzona_consumer_key, 
      enzona_consumer_secret, 
      enzona_merchant_uuid,
      refund_percentage,
      refund_enabled 
    } = req.body;

    const updates = [
      { key: 'enzona_consumer_key', value: enzona_consumer_key || '' },
      { key: 'enzona_consumer_secret', value: enzona_consumer_secret || '' },
      { key: 'enzona_merchant_uuid', value: enzona_merchant_uuid || '' },
      { key: 'refund_percentage', value: refund_percentage?.toString() || '80' },
      { key: 'refund_enabled', value: refund_enabled ? 'true' : 'false' }
    ];

    for (const update of updates) {
      await Settings.findOneAndUpdate(
        { key: update.key },
        { value: update.value },
        { upsert: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('UpdatePaymentSettings error:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

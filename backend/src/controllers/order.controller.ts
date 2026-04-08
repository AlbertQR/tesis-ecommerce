import { Response } from 'express';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import { Product, Address, User, Order, Combo } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { CartItemInput, CheckoutInput, OrderStatus } from '../schemas/validation.js';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

const INVOICES_DIR = path.join(process.cwd(), 'invoices');
const CART_EXPIRATION_MINUTES = 30;

if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
}

function getUserId(req: AuthRequest): mongoose.Types.ObjectId | null {
  const userId = req.user?.id;
  if (!userId || !isValidObjectId(userId)) {
    return null;
  }
  return new mongoose.Types.ObjectId(userId);
}

function getCartExpiration(): Date {
  return new Date(Date.now() + CART_EXPIRATION_MINUTES * 60 * 1000);
}

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }
    
    const user = await User.findById(userId);
    const cart = user?.cart || [];
    res.json({ items: cart, deliveryFee: 100 });
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }
    
    const data = req.body as CartItemInput;
    
    // First try to find in Products collection
    let product = await Product.findById(data.productId);
    let isCombo = false;
    
    // If not found, try in Combos collection
    if (!product) {
      const combo = await Combo.findById(data.productId);
      if (combo) {
        isCombo = true;
        // Create a virtual product object from combo
        product = {
          _id: combo._id,
          name: combo.name,
          image: combo.image,
          price: combo.price,
          stock: 999, // Combos don't have stock limit
          description: combo.description,
          category: 'combo',
          isFeatured: combo.isFeatured || false,
          isHot: false,
          isCombo: true
        } as any;
      }
    }
    
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    if (!isCombo && product.stock < data.quantity) {
      res.status(400).json({ error: 'Stock insuficiente' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    let cart = user.cart || [];
    const existingItem = cart.find(item => item.productId === data.productId);
    let quantityToDeduct = data.quantity;
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (product.stock < newQuantity) {
        res.status(400).json({ error: 'Stock insuficiente' });
        return;
      }
      quantityToDeduct = data.quantity;
      existingItem.quantity = newQuantity;
    } else {
      cart.push({
        productId: product._id.toString(),
        productName: product.name,
        productImage: product.image,
        quantity: data.quantity,
        unitPrice: product.price,
        category: product.category
      });
    }

    if (!isCombo) {
      await Product.findByIdAndUpdate(data.productId, { $inc: { stock: -quantityToDeduct } });
    }
    await User.findByIdAndUpdate(userId, { cart, cartExpiresAt: getCartExpiration() });
    res.json({ items: cart, deliveryFee: 100 });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }
    
    const { productId } = req.params;
    const { quantity } = req.body as { quantity: number };
    
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    let cart = user.cart || [];
    const item = cart.find(i => i.productId === productId);
    
    if (!item) {
      res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      return;
    }

    const previousQuantity = item.quantity;
    let stockDiff = 0;

    if (quantity <= 0) {
      stockDiff = previousQuantity;
      cart = cart.filter(i => i.productId !== productId);
    } else {
      if (product.stock + previousQuantity < quantity) {
        res.status(400).json({ error: 'Stock insuficiente' });
        return;
      }
      stockDiff = quantity - previousQuantity;
      item.quantity = quantity;
    }

    await Product.findByIdAndUpdate(productId, { $inc: { stock: -stockDiff } });
    await User.findByIdAndUpdate(userId, { cart, cartExpiresAt: getCartExpiration() });
    res.json({ items: cart, deliveryFee: 100 });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }
    
    const { productId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    let cart = user.cart || [];
    const item = cart.find(i => i.productId === productId);
    
    if (item) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: item.quantity } });
    }
    
    cart = cart.filter(item => item.productId !== productId);

    await User.findByIdAndUpdate(userId, { cart, cartExpiresAt: cart.length > 0 ? getCartExpiration() : undefined });
    res.json({ items: cart, deliveryFee: 100 });
  } catch (error) {
    console.error('RemoveFromCart error:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const cart = user.cart || [];
    for (const item of cart) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    
    await User.findByIdAndUpdate(userId, { cart: [], cartExpiresAt: undefined });
    res.json({ items: [], deliveryFee: 100 });
  } catch (error) {
    console.error('ClearCart error:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Usuario inválido' });
      return;
    }
    
    const data = req.body as CheckoutInput;
    const paymentMethod = data.paymentMethod || 'cash';
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const cart = user.cart || [];
    
    if (cart.length === 0) {
      res.status(400).json({ error: 'El carrito está vacío' });
      return;
    }

    let address = null;
    if (data.hasDelivery) {
      if (!data.addressId) {
        res.status(400).json({ error: 'Debe seleccionar una dirección de entrega' });
        return;
      }
      address = await Address.findOne({ _id: new mongoose.Types.ObjectId(data.addressId), userId: new mongoose.Types.ObjectId(userId) });
      if (!address) {
        res.status(404).json({ error: 'Dirección no encontrada' });
        return;
      }
    }

    let subtotal = 0;
    for (const item of cart) {
      subtotal += item.unitPrice * item.quantity;
    }

    const shipping = data.hasDelivery ? 100 : 0;
    const total = subtotal + shipping;

    const orderId = `ORD-${Date.now()}`;
    let invoicePath = '';
    try {
      invoicePath = await generateInvoice(orderId, userId.toString(), cart, subtotal, shipping, total, address || {
        label: 'Recogida en tienda',
        street: '',
        number: '',
        city: '',
        neighborhood: ''
      });
    } catch (err) {
      console.error('Error generating invoice:', err);
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      orderId,
      date: new Date(),
      status: 'pending' as OrderStatus,
      paymentMethod,
      paymentStatus: paymentMethod === 'enzona' ? 'pending' : 'pending', // Efectivo: pending hasta confirmar cobro
      items: cart,
      subtotal,
      shipping,
      total,
      deliveryAddress: address ? {
        label: address.label,
        street: address.street,
        number: address.number,
        city: address.city,
        neighborhood: address.neighborhood,
        instructions: address.instructions
      } : {
        label: 'Recogida en tienda'
      },
      invoiceUrl: invoicePath ? `/invoices/${orderId}.pdf` : undefined,
      expiresAt
    });

    // Only clear cart immediately for cash payments
    // For EnZona, cart is cleared after successful payment
    if (paymentMethod === 'cash') {
      await User.findByIdAndUpdate(userId, { cart: [], cartExpiresAt: undefined });
    }

    res.status(201).json({ ...order.toObject(), id: order._id.toString() });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
};

async function generateInvoice(
  orderId: string,
  userId: string,
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number,
  address: { street: string; number: string; city: string; neighborhood: string; instructions?: string; label: string }
): Promise<string> {
  const user = await User.findById(userId);
  
  const qrData = JSON.stringify({ orderId, action: 'verify' });
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 100, margin: 1 });
  const qrBase64 = qrCodeDataUrl.split(',')[1];
  const qrBuffer = Buffer.from(qrBase64, 'base64');
  
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join(INVOICES_DIR, `${orderId}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(24).text('Doña Yoli', { align: 'center' });
    doc.fontSize(12).text('Cafe, Pizza y Despensa', { align: 'center' });
    doc.moveDown();
    doc.text('-'.repeat(50), { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`FACTURA #: ${orderId}`, { align: 'center' });
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown();

    doc.text(`Cliente: ${user?.name || 'Cliente'}`);
    doc.text(`Email: ${user?.email || 'N/A'}`);
    doc.text(`Telefono: ${user?.phone || 'N/A'}`);
    doc.moveDown();

    const addrLabel = address?.label || '';
    const addrStreet = address?.street || '';
    const addrNumber = address?.number || '';
    const addrNeighborhood = address?.neighborhood || '';
    const addrCity = address?.city || '';
    const addrInstructions = address?.instructions || '';

    if (addrLabel === 'Recogida en tienda' || !addrLabel) {
      doc.text('Tipo de entrega: Recogida en tienda');
    } else {
      doc.text('Direccion de entrega:');
      doc.text(`${addrLabel}: ${addrStreet} #${addrNumber}`);
      doc.text(`${addrNeighborhood}, ${addrCity}`);
      if (addrInstructions) {
        doc.text(`Instrucciones: ${addrInstructions}`);
      }
    }
    doc.moveDown();

    doc.text('-'.repeat(50));
    doc.moveDown(0.5);

    doc.fontSize(11).text('DETALLE DEL PEDIDO', { underline: true });
    doc.moveDown(0.5);

    let y = doc.y;
    doc.text('Producto', 50, y);
    doc.text('Cant.', 250, y, { width: 50, align: 'center' });
    doc.text('P.Unitario', 320, y, { width: 80, align: 'right' });
    doc.text('Total', 420, y, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.text('-'.repeat(50));

    for (const item of items) {
      y = doc.y;
      doc.text(item.productName, 50, y, { width: 180 });
      doc.text(item.quantity.toString(), 250, y, { width: 50, align: 'center' });
      doc.text(`$${item.unitPrice.toLocaleString('es-CO')}`, 320, y, { width: 80, align: 'right' });
      doc.text(`$${(item.unitPrice * item.quantity).toLocaleString('es-CO')}`, 420, y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    }

    doc.moveDown();
    doc.text('-'.repeat(50));
    doc.moveDown(0.5);

    const totalsY = doc.y;
    doc.text('Subtotal:', 320, totalsY, { width: 80, align: 'right' });
    doc.text(`$${subtotal.toLocaleString('es-CO')}`, 420, totalsY, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.text('Envio:', 320, doc.y, { width: 80, align: 'right' });
    doc.text(`$${shipping.toLocaleString('es-CO')}`, 420, doc.y, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.fontSize(12).text('TOTAL:', 320, doc.y, { width: 80, align: 'right' });
    doc.text(`$${total.toLocaleString('es-CO')}`, 420, doc.y, { width: 80, align: 'right' });

    doc.moveDown(2);

    doc.image(qrBuffer, 50, doc.y, { width: 80 });
    doc.fontSize(9).text('Escanee para verificar entrega', 50, doc.y + 85, { width: 80, align: 'center' });

    doc.moveDown(2);
    doc.fontSize(10).text('Gracias por su compra en Dona Yoli', { align: 'center' });
    doc.text('www.dona-yoli.com', { align: 'center' });

    doc.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const isAdmin = user.role === 'admin';
    const orders = isAdmin 
      ? await Order.find() 
      : await Order.find({ userId: new mongoose.Types.ObjectId(userId) });
    
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id.toString(), orderId: o.orderId })));
  } catch (error) {
    console.error('GetOrders error:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const user = await User.findById(userId);
    
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    if (user?.role !== 'admin' && order.userId.toString() !== userId) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    res.json({ ...order.toObject(), id: order._id.toString(), orderId: order.orderId });
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find();
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id.toString(), orderId: o.orderId })));
  } catch (error) {
    console.error('GetAllOrders error:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    const previousStatus = order.status;

    if (previousStatus !== 'cancelled' && status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { returnDocument: 'after' }
    );
    
    res.json({ ...updatedOrder!.toObject(), id: updatedOrder!._id.toString() });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    if (order.userId.toString() !== userId) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400).json({ error: 'No se puede cancelar un pedido que ya está en preparación o completado' });
      return;
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'cancelled', updatedAt: new Date() },
      { returnDocument: 'after' }
    );
    
    res.json({ ...updatedOrder!.toObject(), id: updatedOrder!._id.toString() });
  } catch (error) {
    console.error('CancelOrder error:', error);
    res.status(500).json({ error: 'Error al cancelar el pedido' });
  }
};

export const downloadInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const user = await User.findById(userId);
    
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    if (user?.role !== 'admin' && order.userId.toString() !== userId) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    let filePath = '';
    if (order.orderId) {
      filePath = path.join(INVOICES_DIR, `${order.orderId}.pdf`);
    } else {
      filePath = path.join(INVOICES_DIR, `${order._id.toString()}.pdf`);
    }
    
    console.log('Looking for invoice at:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Factura no encontrada', path: filePath });
      return;
    }

    const filename = order.orderId ? `factura-${order.orderId}.pdf` : `factura-${order._id.toString()}.pdf`;
    res.download(filePath, filename);
  } catch (error) {
    console.error('DownloadInvoice error:', error);
    res.status(500).json({ error: 'Error al descargar factura' });
  }
};

export const verifyOrderByQR = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, confirmPayment } = req.body as { orderId: string; confirmPayment?: boolean };
    
    if (!orderId) {
      res.status(400).json({ error: 'ID de pedido requerido' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    // Si se confirma el pago (para efectivo), cambiar paymentStatus a paid
    if (confirmPayment && order.paymentMethod === 'cash' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }

    if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
      res.status(400).json({ 
        error: 'El pedido no puede ser marcado como entregado en su estado actual',
        currentStatus: order.status 
      });
      return;
    }

    order.status = 'delivered';
    order.updatedAt = new Date();
    await order.save();

    res.json({ 
      message: confirmPayment ? 'Pago confirmado y pedido marcado como entregado' : 'Pedido marcado como entregado',
      order: { ...order.toObject(), id: order._id.toString() }
    });
  } catch (error) {
    console.error('VerifyOrderByQR error:', error);
    res.status(500).json({ error: 'Error al verificar pedido' });
  }
};

export async function cleanupExpiredCarts(): Promise<void> {
  try {
    const now = new Date();
    const expiredUsers = await User.find({
      cart: { $exists: true, $ne: [] },
      cartExpiresAt: { $exists: true, $lte: now }
    });

    for (const user of expiredUsers) {
      const cart = user.cart || [];
      for (const item of cart) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
      await User.findByIdAndUpdate(user._id, { cart: [], cartExpiresAt: undefined });
      console.log(`Carrito expirado para usuario ${user.email}`);
    }

    if (expiredUsers.length > 0) {
      console.log(`Se limpiaron ${expiredUsers.length} carritos expirados`);
    }
  } catch (error) {
    console.error('Error al limpiar carritos expirados:', error);
  }
}

export async function cleanupExpiredOrders(): Promise<void> {
  try {
    const now = new Date();
    const expiredOrders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] },
      expiresAt: { $lte: now }
    });

    for (const order of expiredOrders) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
      order.status = 'cancelled';
      order.updatedAt = new Date();
      await order.save();
      console.log(`Pedido ${order._id} cancelado por expiración`);
    }

    if (expiredOrders.length > 0) {
      console.log(`Se cancelaron ${expiredOrders.length} pedidos expirados`);
    }
  } catch (error) {
    console.error('Error al limpiar pedidos expirados:', error);
  }
}

export const updateDeliveryPerson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deliveryPerson } = req.body as { deliveryPerson: string };
    
    const order = await Order.findByIdAndUpdate(
      id,
      { deliveryPerson, updatedAt: new Date() },
      { returnDocument: 'after' }
    );
    
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    
    res.json({ ...order.toObject(), id: order._id.toString() });
  } catch (error) {
    console.error('UpdateDeliveryPerson error:', error);
    res.status(500).json({ error: 'Error al asignar repartidor' });
  }
};

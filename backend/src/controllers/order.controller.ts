import { Response } from 'express';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import { Product, Address, User, Order } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { CartItemInput, CheckoutInput, OrderStatus } from '../schemas/validation.js';
import fs from 'fs';
import path from 'path';

interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

const INVOICES_DIR = path.join(process.cwd(), 'invoices');

if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

export const getCart = (req: AuthRequest, res: Response): void => {
  const cart = (req.session as { cart?: CartItem[] }).cart || [];
  res.json({ items: cart, deliveryFee: 100 });
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as CartItemInput;
    const product = await Product.findById(data.productId);
    
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    if (product.stock < data.quantity) {
      res.status(400).json({ error: 'Stock insuficiente' });
      return;
    }

    const session = req.session as { cart?: CartItem[] };
    if (!session.cart) {
      session.cart = [];
    }

    const existingItem = session.cart.find(item => item.productId === data.productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (product.stock < newQuantity) {
        res.status(400).json({ error: 'Stock insuficiente' });
        return;
      }
      existingItem.quantity = newQuantity;
    } else {
      session.cart.push({
        productId: product._id.toString(),
        productName: product.name,
        productImage: product.image,
        quantity: data.quantity,
        unitPrice: product.price
      });
    }

    req.session.save(() => {
      res.json({ items: session.cart, deliveryFee: 100 });
    });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body as { quantity: number };
    
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: 'Stock insuficiente' });
      return;
    }

    const session = req.session as { cart?: CartItem[] };
    if (!session.cart) {
      res.status(404).json({ error: 'Carrito vacío' });
      return;
    }

    const item = session.cart.find(i => i.productId === productId);
    if (!item) {
      res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      return;
    }

    if (quantity <= 0) {
      session.cart = session.cart.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    req.session.save(() => {
      res.json({ items: session.cart, deliveryFee: 100 });
    });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
};

export const removeFromCart = (req: AuthRequest, res: Response): void => {
  const { productId } = req.params;
  const session = req.session as { cart?: CartItem[] };
  
  if (!session.cart) {
    res.status(404).json({ error: 'Carrito vacío' });
    return;
  }

  session.cart = session.cart.filter(item => item.productId !== productId);
  req.session.save(() => {
    res.json({ items: session.cart, deliveryFee: 100 });
  });
};

export const clearCart = (req: AuthRequest, res: Response): void => {
  const session = req.session as { cart?: CartItem[] };
  session.cart = [];
  req.session.save(() => {
    res.json({ items: [], deliveryFee: 100 });
  });
};

declare module 'express-session' {
  interface SessionData {
    cart?: CartItem[];
  }
}

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as CheckoutInput;
    const session = req.session as { cart?: CartItem[] };
    
    if (!session.cart || session.cart.length === 0) {
      res.status(400).json({ error: 'El carrito está vacío' });
      return;
    }

    const address = await Address.findOne({ _id: new mongoose.Types.ObjectId(data.addressId), userId: new mongoose.Types.ObjectId(req.user?.id) });
    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    let subtotal = 0;
    for (const item of session.cart) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        res.status(400).json({ error: `Producto ${item.productName} sin stock suficiente` });
        return;
      }
      subtotal += item.unitPrice * item.quantity;
    }

    const shipping = data.hasDelivery ? 100 : 0;
    const total = subtotal + shipping;

    for (const item of session.cart) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const orderId = `ORD-${Date.now()}`;
    const invoicePath = await generateInvoice(orderId, req.user!.id, session.cart, subtotal, shipping, total, address);

    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(req.user!.id),
      date: new Date(),
      status: 'pending' as OrderStatus,
      items: session.cart,
      subtotal,
      shipping,
      total,
      deliveryAddress: {
        street: address.street,
        number: address.number,
        city: address.city,
        neighborhood: address.neighborhood,
        instructions: address.instructions
      },
      invoiceUrl: `/invoices/${orderId}.pdf`
    });

    session.cart = [];

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
  
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join(INVOICES_DIR, `${orderId}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(24).text('Doña Yoli', { align: 'center' });
    doc.fontSize(12).text('Café, Pizza y Despensa', { align: 'center' });
    doc.moveDown();
    doc.text('─'.repeat(50), { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`FACTURA #: ${orderId}`, { align: 'center' });
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' });
    doc.moveDown();

    doc.text(`Cliente: ${user?.name || 'Cliente'}`);
    doc.text(`Email: ${user?.email || 'N/A'}`);
    doc.text(`Teléfono: ${user?.phone || 'N/A'}`);
    doc.moveDown();

    doc.text(`Dirección de entrega:`);
    doc.text(`${address.label}: ${address.street} #${address.number}`);
    doc.text(`${address.neighborhood}, ${address.city}`);
    if (address.instructions) {
      doc.text(`Instrucciones: ${address.instructions}`);
    }
    doc.moveDown();

    doc.text('─'.repeat(50));
    doc.moveDown(0.5);

    doc.fontSize(11).text('DETALLE DEL PEDIDO', { underline: true });
    doc.moveDown(0.5);

    let y = doc.y;
    doc.text('Producto', 50, y);
    doc.text('Cant.', 250, y, { width: 50, align: 'center' });
    doc.text('P.Unitario', 320, y, { width: 80, align: 'right' });
    doc.text('Total', 420, y, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.text('─'.repeat(50));

    for (const item of items) {
      y = doc.y;
      doc.text(item.productName, 50, y, { width: 180 });
      doc.text(item.quantity.toString(), 250, y, { width: 50, align: 'center' });
      doc.text(`$${item.unitPrice.toLocaleString('es-CO')}`, 320, y, { width: 80, align: 'right' });
      doc.text(`$${(item.unitPrice * item.quantity).toLocaleString('es-CO')}`, 420, y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    }

    doc.moveDown();
    doc.text('─'.repeat(50));
    doc.moveDown(0.5);

    const totalsY = doc.y;
    doc.text('Subtotal:', 320, totalsY, { width: 80, align: 'right' });
    doc.text(`$${subtotal.toLocaleString('es-CO')}`, 420, totalsY, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.text('Envío:', 320, doc.y, { width: 80, align: 'right' });
    doc.text(`$${shipping.toLocaleString('es-CO')}`, 420, doc.y, { width: 80, align: 'right' });

    doc.moveDown(0.5);
    doc.fontSize(12).text('TOTAL:', 320, doc.y, { width: 80, align: 'right' });
    doc.text(`$${total.toLocaleString('es-CO')}`, 420, doc.y, { width: 80, align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).text('Gracias por su compra en Doña Yoli', { align: 'center' });
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
    
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id.toString() })));
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

    res.json({ ...order.toObject(), id: order._id.toString() });
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find();
    res.json(orders.map(o => ({ ...o.toObject(), id: o._id.toString() })));
  } catch (error) {
    console.error('GetAllOrders error:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    res.json({ ...order.toObject(), id: order._id.toString() });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
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

    const filePath = path.join(INVOICES_DIR, `${id}.pdf`);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Factura no encontrada' });
      return;
    }

    res.download(filePath, `factura-${id}.pdf`);
  } catch (error) {
    console.error('DownloadInvoice error:', error);
    res.status(500).json({ error: 'Error al descargar factura' });
  }
};

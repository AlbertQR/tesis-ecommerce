import mongoose, { Document, Schema } from 'mongoose';

/**
 * Estados posibles de un pedido en el sistema.
 * 
 * @typedef {'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'} OrderStatus
 */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

/**
 * Interfaz que define un item individual dentro de un pedido.
 * 
 * @interface ICartItem
 * 
 * @property {string} productId - ID del producto
 * @property {string} productName - Nombre del producto al momento de compra
 * @property {string} productImage - URL de imagen del producto
 * @property {number} quantity - Cantidad solicitada
 * @property {number} unitPrice - Precio unitario al momento de compra
 */
export interface ICartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

/**
 * Interfaz que define la estructura de un pedido/order.
 * Representa una compra completada por un usuario.
 * 
 * @interface IOrder
 * @extends Document
 * 
 * @property {mongoose.Types.ObjectId} userId - Referencia al usuario que realizó el pedido
 * @property {Date} date - Fecha del pedido
 * @property {OrderStatus} status - Estado actual del pedido
 * @property {ICartItem[]} items - Lista de productos pedidos
 * @property {number} subtotal - Subtotal sin envío
 * @property {number} shipping - Costo de envío
 * @property {number} total - Total incluyendo envío
 * @property {object} deliveryAddress - Dirección de entrega
 * @property {string} [invoiceUrl] - URL de la factura PDF
 * @property {Date} expiresAt - Fecha de expiración del pedido (24 horas)
 * @property {Date} createdAt - Fecha de creación del pedido
 * @property {Date} updatedAt - Fecha de última modificación
 */
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  date: Date;
  status: OrderStatus;
  items: ICartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryAddress?: {
    label: string;
    street?: string;
    number?: string;
    city?: string;
    neighborhood?: string;
    instructions?: string;
  };
  invoiceUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  transactionUuid?: string;
  paymentMethod?: 'cash' | 'enzona';
  paymentConfirmUrl?: string;
  paymentCompleteUrl?: string;
  refundAmount?: number;
  refundPercentage?: number;
  refundTransactionUuid?: string;
}

/**
 * Esquema de Mongoose para la colección de pedidos.
 * 
 * @constant CartItemSchema
 * @type {Schema<ICartItem>}
 */
const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  category: { type: String, required: true }
});

/**
 * Esquema de Mongoose para la colección de pedidos.
 * 
 * @constant OrderSchema
 * @type {Schema<IOrder>}
 */
const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  items: [CartItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  deliveryAddress: {
    label: { type: String, required: false },
    street: { type: String, required: false },
    number: { type: String, required: false },
    city: { type: String, required: false },
    neighborhood: { type: String, required: false },
    instructions: { type: String }
  },
  invoiceUrl: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  transactionUuid: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'enzona'],
    default: 'cash'
  },
  paymentConfirmUrl: { type: String },
  paymentCompleteUrl: { type: String },
  refundAmount: { type: Number },
  refundPercentage: { type: Number },
  refundTransactionUuid: { type: String }
});

/**
 * Modelo de Mongoose para la colección de pedidos.
 * 
 * @constant Order
 * @type {Model<IOrder>}
 */
export const Order = mongoose.model<IOrder>('Order', OrderSchema);

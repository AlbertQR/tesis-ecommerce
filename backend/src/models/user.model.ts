import mongoose, { Document, Schema } from 'mongoose';

interface ICartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Interfaz que define la estructura de un usuario en la base de datos.
 * Representa tanto usuarios regulares como administradores del sistema.
 * 
 * @interface IUser
 * @extends Document
 * 
 * @property {string} email - Correo electrónico único del usuario
 * @property {string} password - Contraseña hasheada del usuario
 * @property {string} name - Nombre completo del usuario
 * @property {string} phone - Número de teléfono de contacto
 * @property {string} [avatar] - URL opcional de la foto de perfil
 * @property {'user' | 'admin'} role - Rol del usuario en el sistema
 * @property {ICartItem[]} cart - Carrito de compras del usuario
 * @property {Date} cartExpiresAt - Fecha de expiración del carrito (30 min)
 * @property {Date} createdAt - Fecha de creación del registro
 * @property {Date} updatedAt - Fecha de última modificación
 */
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin';
  cart: ICartItem[];
  cartExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para la colección de usuarios.
 * Define las validaciones y configuración de cada campo.
 * 
 * @constant UserSchema
 * @type {Schema<IUser>}
 */
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  cart: { type: Schema.Types.Mixed as any, default: [] },
  cartExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Modelo de Mongoose para la colección de usuarios.
 * Proporciona métodos para CRUD y consultas a la base de datos.
 * 
 * @constant User
 * @type {Model<IUser>}
 */
export const User = mongoose.model<IUser>('User', UserSchema);

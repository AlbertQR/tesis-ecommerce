import mongoose, { Document, Schema } from 'mongoose';

/**
 * Categorías disponibles para los productos.
 * 
 * @typedef {'cafeteria' | 'pizzeria' | 'despensa' | 'combo'} ProductCategory
 */
export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';

/**
 * Interfaz que define la estructura de un producto en el catálogo.
 * Incluye información de precio, stock, categoría y atributos visuales.
 * 
 * @interface IProduct
 * @extends Document
 * 
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción detallada del producto
 * @property {number} price - Precio en pesos colombianos (COP)
 * @property {ProductCategory} category - Categoría del producto
 * @property {string} image - URL de la imagen del producto
 * @property {boolean} [isFeatured] - Indica si es un producto destacado
 * @property {boolean} [isHot] - Indica si es un producto popular/hot
 * @property {boolean} [isCombo] - Indica si es un combo especial
 * @property {number} stock - Cantidad disponible en inventario
 * @property {Date} createdAt - Fecha de creación del registro
 * @property {Date} updatedAt - Fecha de última modificación
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isCombo?: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para la colección de productos.
 * Define validaciones y restricciones para cada campo.
 * 
 * @constant ProductSchema
 * @type {Schema<IProduct>}
 */
const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['cafeteria', 'pizzeria', 'despensa', 'combo'], required: true },
  image: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  isCombo: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Índices para optimizar queries
ProductSchema.index({ category: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isHot: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

/**
 * Modelo de Mongoose para la colección de productos.
 * 
 * @constant Product
 * @type {Model<IProduct>}
 */
export const Product = mongoose.model<IProduct>('Product', ProductSchema);

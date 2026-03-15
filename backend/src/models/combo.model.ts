import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interfaz que define la estructura de un combo promocional.
 * Los combos agrupan productos con descuento especial.
 * 
 * @interface ICombo
 * @extends Document
 * 
 * @property {string} name - Nombre del combo
 * @property {string} description - Descripción de lo que incluye el combo
 * @property {number} price - Precio especial del combo
 * @property {number} [originalPrice] - Precio original sin descuento
 * @property {string} image - URL de imagen del combo
 * @property {string[]} includes - Lista de elementos incluidos
 * @property {boolean} [isFeatured] - Indica si es un combo destacado
 * @property {number} [discount] - Porcentaje de descuento aplicado
 */
export interface ICombo extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  includes: string[];
  isFeatured?: boolean;
  discount?: number;
}

/**
 * Esquema de Mongoose para la colección de combos.
 * 
 * @constant ComboSchema
 * @type {Schema<ICombo>}
 */
const ComboSchema = new Schema<ICombo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  includes: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  discount: { type: Number }
});

/**
 * Modelo de Mongoose para la colección de combos.
 * 
 * @constant Combo
 * @type {Model<ICombo>}
 */
export const Combo = mongoose.model<ICombo>('Combo', ComboSchema);

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interfaz que define la estructura de una categoría de productos.
 * Las categorías organizan el catálogo de productos.
 * 
 * @interface ICategory
 * @extends Document
 * 
 * @property {string} id - Identificador único de la categoría
 * @property {string} name - Nombre visible de la categoría
 * @property {string} description - Descripción de la categoría
 * @property {string} image - URL de imagen representativa
 * @property {string} icon - Clase de Font Awesome (ej: fa-mug-hot)
 */
export interface ICategory extends Document {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

/**
 * Esquema de Mongoose para la colección de categorías.
 * 
 * @constant CategorySchema
 * @type {Schema<ICategory>}
 */
const CategorySchema = new Schema<ICategory>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  icon: { type: String, default: 'fa-folder' }
});

/**
 * Modelo de Mongoose para la colección de categorías.
 * 
 * @constant Category
 * @type {Model<ICategory>}
 */
export const Category = mongoose.model<ICategory>('Category', CategorySchema);

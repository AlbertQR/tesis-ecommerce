import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interfaz que define la estructura de contenido dinámico del sitio.
 * Permite modificar textos sin cambiar el código.
 * 
 * @interface IContent
 * @extends Document
 * 
 * @property {string} key - Clave única para identificar el contenido
 * @property {string} value - Valor/texto del contenido
 * @property {'text' | 'image' | 'json'} type - Tipo de contenido
 * @property {Date} updatedAt - Fecha de última modificación
 */
export interface IContent extends Document {
  key: string;
  value: string;
  type: 'text' | 'image' | 'json';
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para la colección de contenidos.
 * 
 * @constant ContentSchema
 * @type {Schema<IContent>}
 */
const ContentSchema = new Schema<IContent>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'json'], default: 'text' },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Modelo de Mongoose para la colección de contenidos.
 * 
 * @constant Content
 * @type {Model<IContent>}
 */
export const Content = mongoose.model<IContent>('Content', ContentSchema);

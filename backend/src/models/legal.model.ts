import mongoose, { Document, Schema } from 'mongoose';

/**
 * Tipos de documentos legales disponibles en el sistema.
 * 
 * @typedef {'terms' | 'privacy' | 'returns'} LegalType
 */
export type LegalType = 'terms' | 'privacy' | 'returns';

/**
 * Interfaz que define la estructura de un documento legal.
 * Incluye términos, políticas de privacidad y devoluciones.
 * 
 * @interface ILegal
 * @extends Document
 * 
 * @property {LegalType} type - Tipo de documento legal
 * @property {string} title - Título del documento
 * @property {string} content - Contenido HTML del documento
 * @property {boolean} isActive - Indica si el documento está activo/visible
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última modificación
 */
export interface ILegal extends Document {
  type: LegalType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para la colección de documentos legales.
 * Solo existe un documento por tipo.
 * 
 * @constant LegalSchema
 * @type {Schema<ILegal>}
 */
const LegalSchema = new Schema<ILegal>({
  type: { type: String, enum: ['terms', 'privacy', 'returns'], required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Modelo de Mongoose para la colección de documentos legales.
 * 
 * @constant Legal
 * @type {Model<ILegal>}
 */
export const Legal = mongoose.model<ILegal>('Legal', LegalSchema);

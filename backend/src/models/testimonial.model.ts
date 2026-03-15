import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interfaz que define la estructura de un testimonio/cliente satisfecho.
 * Los testimonios se muestran en la página principal para generar confianza.
 * 
 * @interface ITestimonial
 * @extends Document
 * 
 * @property {string} name - Nombre del cliente
 * @property {string} role - Rol o relación con el negocio (ej: "Cliente Frecuente")
 * @property {string} comment - Testimonio o opinión del cliente
 * @property {number} rating - Calificación de 1 a 5 estrellas
 * @property {string} initials - Iniciales del cliente para mostrar avatar
 * @property {string} image - URL de la imagen del cliente (opcional)
 */
export interface ITestimonial extends Document {
  name: string;
  role: string;
  comment: string;
  rating: number;
  initials: string;
  image?: string;
}

/**
 * Esquema de Mongoose para la colección de testimonios.
 * 
 * @constant TestimonialSchema
 * @type {Schema<ITestimonial>}
 */
const TestimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  initials: { type: String, required: true },
  image: { type: String }
});

/**
 * Modelo de Mongoose para la colección de testimonios.
 * 
 * @constant Testimonial
 * @type {Model<ITestimonial>}
 */
export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

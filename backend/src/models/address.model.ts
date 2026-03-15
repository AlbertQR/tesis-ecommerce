import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interfaz que define la estructura de una dirección de entrega.
 * Cada dirección pertenece a un usuario y puede ser usada para pedidos.
 * 
 * @interface IAddress
 * @extends Document
 * 
 * @property {mongoose.Types.ObjectId} userId - Referencia al usuario propietario
 * @property {string} label - Etiqueta identificadora (ej: "Casa", "Oficina")
 * @property {string} street - Nombre de la calle
 * @property {string} number - Número de dirección
 * @property {string} city - Ciudad de entrega
 * @property {string} neighborhood - Barrio o sector
 * @property {string} [instructions] - Instrucciones adicionales de entrega
 * @property {boolean} isDefault - Indica si es la dirección principal
 * @property {Date} createdAt - Fecha de creación del registro
 * @property {Date} updatedAt - Fecha de última modificación
 */
export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para la colección de direcciones.
 * 
 * @constant AddressSchema
 * @type {Schema<IAddress>}
 */
const AddressSchema = new Schema<IAddress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: String, required: true },
  city: { type: String, required: true },
  neighborhood: { type: String, required: true },
  instructions: { type: String },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Modelo de Mongoose para la colección de direcciones.
 * 
 * @constant Address
 * @type {Model<IAddress>}
 */
export const Address = mongoose.model<IAddress>('Address', AddressSchema);

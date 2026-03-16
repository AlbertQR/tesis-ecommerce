import { z } from 'zod';

export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'Teléfono inválido')
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  avatar: z.string().url().optional(),
  email: z.string().email().optional()
});

export const addressSchema = z.object({
  label: z.string().min(1, 'La etiqueta es requerida'),
  street: z.string().min(1, 'La calle es requerida'),
  number: z.string().min(1, 'El número es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  neighborhood: z.string().min(1, 'El barrio es requerido'),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false)
});

export const updateAddressSchema = addressSchema.partial();

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().positive('El precio debe ser positivo'),
  category: z.enum(['cafeteria', 'pizzeria', 'despensa', 'combo']),
  image: z.string().url('URL de imagen inválida'),
  isFeatured: z.boolean().optional(),
  isHot: z.boolean().optional(),
  isCombo: z.boolean().optional(),
  stock: z.number().int().min(0, 'El stock no puede ser negativo')
});

export const updateProductSchema = productSchema.partial();

export const testimonialSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  role: z.string().min(1, 'El rol es requerido'),
  comment: z.string().min(1, 'El comentario es requerido'),
  rating: z.number().min(0).max(5, 'La calificación debe estar entre 0 y 5'),
  initials: z.string().min(1, 'Las iniciales son requeridas')
});

export const comboSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().positive('El precio debe ser positivo'),
  originalPrice: z.number().positive().optional(),
  image: z.string().url('URL de imagen inválida'),
  includes: z.array(z.string()),
  isFeatured: z.boolean().optional(),
  discount: z.number().optional()
});

export const contentSchema = z.object({
  key: z.string().min(1, 'La clave es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
  type: z.enum(['text', 'image', 'json'])
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0')
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'La dirección es requerida'),
  hasDelivery: z.boolean(),
  paymentMethod: z.enum(['cash', 'enzona']).optional().default('cash')
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type ComboInput = z.infer<typeof comboSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

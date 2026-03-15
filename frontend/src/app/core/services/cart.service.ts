import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, CartItem, CartItemResponse } from '../models/product.model';
import { tap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Costo de envío fijo para deliveries.
 * @constant {number} DELIVERY_FEE
 */
const DELIVERY_FEE = 100;

/**
 * Interfaz que define la estructura de un item en el carrito.
 * 
 * @interface CartItem
 * 
 * @property {Product} product - Datos del producto
 * @property {number} quantity - Cantidad seleccionada
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Interfaz que define la respuesta del API para items del carrito.
 * 
 * @interface CartItemResponse
 * 
 * @property {string} productId - ID del producto
 * @property {string} productName - Nombre del producto
 * @property {string} productImage - URL de imagen del producto
 * @property {number} quantity - Cantidad en el carrito
 * @property {number} unitPrice - Precio unitario
 */
export interface CartItemResponse {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Interfaz que define la estructura de un producto.
 * 
 * @interface Product
 * 
 * @property {string} id - Identificador único
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción del producto
 * @property {number} price - Precio en COP
 * @property {ProductCategory} category - Categoría del producto
 * @property {string} image - URL de la imagen
 * @property {number} stock - Cantidad disponible
 * @property {boolean} [isFeatured] - Indica si es destacado
 * @property {boolean} [isHot] - Indica si es popular
 * @property {boolean} [isCombo] - Indica si es un combo
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  stock: number;
  isFeatured?: boolean;
  isHot?: boolean;
  isCombo?: boolean;
}

/**
 * Categorías disponibles para los productos.
 * @typedef {'cafeteria' | 'pizzeria' | 'despensa' | 'combo'} ProductCategory
 */
export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';

/**
 * Servicio para gestionar el carrito de compras del usuario.
 * Utiliza signals para mantener el estado reactivo del carrito.
 * 
 * @service CartService
 * @description Proporciona métodos para agregar, actualizar y eliminar productos del carrito.
 *              También maneja el proceso de checkout y cálculo de totales.
 *              Solo funciona para usuarios autenticados.
 * 
 * @example
 * ```typescript
 * constructor(private cartService: CartService) {
 *   const items = this.cartService.cartItems();
 *   const total = this.cartService.cartTotal();
 * }
 * ```
 * 
 * @requires HttpClient
 * @requires AuthService
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  /** URL base del API */
  private apiUrl = 'http://localhost:3000/api';
  
  /** Inyección del servicio de autenticación */
  private authService = inject(AuthService);
  
  /** Signal para almacenar los items del carrito */
  private items = signal<CartItem[]>([]);
  
  /** Signal para almacenar el costo de envío */
  private deliveryFeeSignal = signal(DELIVERY_FEE);

  /**
   * Signal que indica si el usuario quiere delivery.
   * @readonly
   */
  readonly hasDelivery = signal(false);
  
  /**
   * Referencia de solo lectura al signal de items.
   * @readonly
   */
  readonly cartItems = this.items.asReadonly();

  /**
   * Computed signal con la cantidad total de items en el carrito.
   * @readonly
   */
  readonly cartCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  /**
   * Computed signal con el subtotal (sin envío).
   * @readonly
   */
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  /**
   * Computed signal con el costo de envío.
   * Retorna 0 si no hay delivery.
   * @readonly
   */
  readonly deliveryFee = computed(() => 
    this.hasDelivery() ? this.deliveryFeeSignal() : 0
  );

  /**
   * Computed signal con el total (subtotal + envío).
   * @readonly
   */
  readonly cartTotal = computed(() =>
    this.subtotal() + this.deliveryFee()
  );

  /**
   * Constructor del servicio.
   * Carga el carrito si el usuario está autenticado.
   * 
   * @param {HttpClient} http - Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {
    this.loadCart();
  }

  /**
   * Carga el carrito desde el API.
   * Solo se ejecuta si el usuario está autenticado.
   * 
   * @method loadCart
   * @private
   */
  private loadCart(): void {
    if (this.authService.isAuthenticated()) {
      this.http.get<{ items: CartItemResponse[]; deliveryFee: number }>(`${this.apiUrl}/cart`).pipe(
        tap(response => {
          const items = response.items.map(item => ({
            product: {
              id: item.productId,
              name: item.productName,
              image: item.productImage,
              price: item.unitPrice,
              description: '',
              category: 'cafeteria' as const
            },
            quantity: item.quantity
          }));
          this.items.set(items);
          this.deliveryFeeSignal.set(response.deliveryFee);
        }),
        catchError(() => of({ items: [], deliveryFee: DELIVERY_FEE }))
      ).subscribe();
    }
  }

  /**
   * Transforma los items de la respuesta del API al formato interno.
   * 
   * @method transformItems
   * @private
   * @param {CartItemResponse[]} items - Items en formato de respuesta API
   * @returns {CartItem[]} Items transformados
   */
  private transformItems(items: CartItemResponse[]): CartItem[] {
    return items.map(item => ({
      product: {
        id: item.productId,
        name: item.productName,
        image: item.productImage,
        price: item.unitPrice,
        description: '',
        category: 'cafeteria' as const
      },
      quantity: item.quantity
    }));
  }

  /**
   * Alterna la opción de delivery entre activo e inactivo.
   * 
   * @method toggleDelivery
   * @returns {void}
   */
  toggleDelivery(): void {
    this.hasDelivery.update(v => !v);
  }

  /**
   * Establece la opción de delivery.
   * 
   * @method setDelivery
   * @param {boolean} value - true para delivery, false para recogida
   * @returns {void}
   */
  setDelivery(value: boolean): void {
    this.hasDelivery.set(value);
  }

  /**
   * Verifica si el usuario puede agregar productos al carrito.
   * 
   * @method canAddToCart
   * @returns {boolean} true si el usuario está autenticado
   */
  canAddToCart(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Agrega un producto al carrito.
   * 
   * @method addToCart
   * @param {Product} product - Producto a agregar
   * @returns {boolean} true si se agregó exitosamente, false si no está autenticado
   */
  addToCart(product: Product): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    
    this.http.post<{ items: CartItemResponse[] }>(`${this.apiUrl}/cart`, {
      productId: product.id,
      quantity: 1
    }).pipe(
      tap(response => this.items.set(this.transformItems(response.items)))
    ).subscribe();
    
    return true;
  }

  /**
   * Elimina un producto del carrito.
   * 
   * @method removeFromCart
   * @param {string} productId - ID del producto a eliminar
   * @returns {void}
   */
  removeFromCart(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    
    this.http.delete<{ items: CartItemResponse[] }>(`${this.apiUrl}/cart/${productId}`).pipe(
      tap(response => this.items.set(this.transformItems(response.items)))
    ).subscribe();
  }

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * Si la cantidad es 0 o menor, elimina el producto.
   * 
   * @method updateQuantity
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {void}
   */
  updateQuantity(productId: string, quantity: number): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.http.put<{ items: CartItemResponse[] }>(`${this.apiUrl}/cart/${productId}`, { quantity }).pipe(
      tap(response => this.items.set(this.transformItems(response.items)))
    ).subscribe();
  }

  /**
   * Vacía completamente el carrito.
   * 
   * @method clearCart
   * @returns {void}
   */
  clearCart(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    
    this.http.delete(`${this.apiUrl}/cart`).pipe(
      tap(() => this.items.set([]))
    ).subscribe();
  }

  /**
   * Realiza el checkout del carrito.
   * Crea un pedido con la información actual.
   * 
   * @method checkout
   * @param {string} addressId - ID de la dirección de entrega
   * @param {boolean} hasDelivery - Indica si es delivery
   * @returns {Observable} Observable con la respuesta del servidor
   */
  checkout(addressId: string, hasDelivery: boolean) {
    return this.http.post<any>(`${this.apiUrl}/checkout`, { addressId, hasDelivery }).pipe(
      tap(() => this.items.set([]))
    );
  }
}

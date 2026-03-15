import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Category, Testimonial, Combo } from '../models/product.model';
import { tap } from 'rxjs';

/**
 * Interfaz que define la estructura de un producto.
 * 
 * @interface Product
 * 
 * @property {string} id - Identificador único del producto
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción detallada
 * @property {number} price - Precio en COP
 * @property {ProductCategory} category - Categoría del producto
 * @property {string} image - URL de la imagen
 * @property {boolean} [isFeatured] - Indica si es destacado
 * @property {boolean} [isHot] - Indica si es popular
 * @property {boolean} [isCombo] - Indica si es un combo
 * @property {number} stock - Cantidad disponible
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isCombo?: boolean;
  stock: number;
}

/**
 * Categorías disponibles para los productos.
 * 
 * @typedef {'cafeteria' | 'pizzeria' | 'despensa' | 'combo'} ProductCategory
 */
export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';

/**
 * Interfaz que define la estructura de una categoría.
 * 
 * @interface Category
 * 
 * @property {string} id - Identificador único
 * @property {string} name - Nombre de la categoría
 * @property {string} description - Descripción
 * @property {string} image - URL de imagen
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

/**
 * Interfaz que define la estructura de un testimonio.
 * 
 * @interface Testimonial
 * 
 * @property {string} id - Identificador único
 * @property {string} name - Nombre del cliente
 * @property {string} role - Rol o relación
 * @property {string} comment - Testimonio
 * @property {number} rating - Calificación (1-5)
 * @property {string} initials - Iniciales para avatar
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  initials: string;
}

/**
 * Interfaz que define la estructura de un combo.
 * 
 * @interface Combo
 * 
 * @property {string} id - Identificador único
 * @property {string} name - Nombre del combo
 * @property {string} description - Descripción
 * @property {number} price - Precio especial
 * @property {number} [originalPrice] - Precio sin descuento
 * @property {string} image - URL de imagen
 * @property {string[]} includes - Elementos incluidos
 * @property {boolean} [isFeatured] - Indica si es destacado
 * @property {number} [discount] - Porcentaje de descuento
 */
export interface Combo {
  id: string;
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
 * Servicio para gestionar los datos públicos del sitio: productos, categorías, testimonios y combos.
 * Utiliza signals para mantener el estado reactivo de los datos.
 * 
 * @service DataService
 * @description Proporciona acceso a productos, categorías, testimonios y combos destacados.
 *              Los datos se cargan automáticamente al iniciar el servicio y están disponibles
 *              públicamente sin necesidad de autenticación.
 * 
 * @example
 * ```typescript
 * constructor(private dataService: DataService) {
 *   const products = this.dataService.products();
 *   const categories = this.dataService.categories();
 *   const featured = this.dataService.getFeaturedProducts();
 * }
 * ```
 * 
 * @requires HttpClient
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  /** URL base del API */
  private apiUrl = 'http://localhost:3000/api';

  /** Signal para almacenar los productos */
  private productsSignal = signal<Product[]>([]);
  
  /** Signal para almacenar las categorías */
  private categoriesSignal = signal<Category[]>([]);
  
  /** Signal para almacenar los testimonios */
  private testimonialsSignal = signal<Testimonial[]>([]);
  
  /** Signal para almacenar el combo destacado */
  private comboSignal = signal<Combo | null>(null);

  /** Referencia de solo lectura al signal de productos */
  readonly products = this.productsSignal.asReadonly();
  
  /** Referencia de solo lectura al signal de categorías */
  readonly categories = this.categoriesSignal.asReadonly();
  
  /** Referencia de solo lectura al signal de testimonios */
  readonly testimonials = this.testimonialsSignal.asReadonly();
  
  /** Referencia de solo lectura al signal de combo destacado */
  readonly featuredCombo = this.comboSignal.asReadonly();

  /**
   * Constructor del servicio.
   * Inicia la carga de todos los datos públicos.
   * 
   * @param {HttpClient} http - Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {
    this.loadData();
  }

  /**
   * Carga todos los datos del sitio: productos, categorías, testimonios y combos.
   * Se ejecuta automáticamente al crear el servicio.
   * 
   * @method loadData
   * @private
   */
  private loadData(): void {
    this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      tap(products => this.productsSignal.set(products))
    ).subscribe();

    this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => this.categoriesSignal.set(categories))
    ).subscribe();

    this.http.get<Testimonial[]>(`${this.apiUrl}/testimonials`).pipe(
      tap(testimonials => this.testimonialsSignal.set(testimonials))
    ).subscribe();

    this.http.get<Combo[]>(`${this.apiUrl}/combos?featured=true`).pipe(
      tap(combos => this.comboSignal.set(combos[0] || null))
    ).subscribe();
  }

  /**
   * Obtiene los productos filtrados por categoría.
   * 
   * @method getProductsByCategory
   * @param {string} category - Categoría por la cual filtrar
   * @returns {Product[]} Array de productos de la categoría especificada
   * 
   * @example
   * ```typescript
   * const pizzas = this.dataService.getProductsByCategory('pizzeria');
   * ```
   */
  getProductsByCategory(category: string): Product[] {
    return this.productsSignal().filter(p => p.category === category);
  }

  /**
   * Obtiene los productos destacados.
   * 
   * @method getFeaturedProducts
   * @returns {Product[]} Array de productos marcados como destacados
   * 
   * @example
   * ```typescript
   * const featured = this.dataService.getFeaturedProducts();
   * ```
   */
  getFeaturedProducts(): Product[] {
    return this.productsSignal().filter(p => p.isFeatured);
  }

  /**
   * Obtiene un producto por su ID.
   * 
   * @method getProductById
   * @param {string} id - ID del producto a buscar
   * @returns {Product | undefined} El producto encontrado o undefined
   * 
   * @example
   * ```typescript
   * const product = this.dataService.getProductById('123');
   * ```
   */
  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  /**
   * Actualiza la lista de productos desde el API.
   * 
   * @method refreshProducts
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.dataService.refreshProducts();
   * ```
   */
  refreshProducts(): void {
    this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      tap(products => this.productsSignal.set(products))
    ).subscribe();
  }

  /**
   * Actualiza la lista de categorías desde el API.
   * 
   * @method refreshCategories
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.dataService.refreshCategories();
   * ```
   */
  refreshCategories(): void {
    this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => this.categoriesSignal.set(categories))
    ).subscribe();
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product as ProductModel, Category as CategoryModel, Testimonial as TestimonialModel, Combo as ComboModel, ProductCategory as ProductCategoryModel } from '../models/product.model';
import { tap } from 'rxjs';

export type Product = ProductModel;
export type Category = CategoryModel;
export type Testimonial = TestimonialModel;
export type Combo = ComboModel;
export type ProductCategory = ProductCategoryModel;

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

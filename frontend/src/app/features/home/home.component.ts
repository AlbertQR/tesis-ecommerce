import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

/**
 * Componente de la página principal (Home).
 * Muestra categorías, productos destacados, combo destacado y testimonios.
 * 
 * @component HomeComponent
 * @description Es la página de inicio del sitio. Muestra una vista general
 *              de las categorías disponibles, productos destacados, el combo
 *              promocional del día y testimonios de clientes.
 * 
 * @example
 * ```html
 * <app-home></app-home>
 * ```
 * 
 * @requires DataService
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  /** Servicio de datos para acceder a productos, categorías y testimonios */
  private dataService = inject(DataService);

  /**
   * Categorías disponibles desde el servicio.
   * @readonly
   */
  categories = this.dataService.categories;
  
  /**
   * Productos destacados desde el servicio.
   * @readonly
   */
  featuredProducts = this.dataService.products;
  
  /**
   * Combo destacado desde el servicio.
   * @readonly
   */
  featuredCombo = this.dataService.featuredCombo;
  
  /**
   * Testimonios de clientes desde el servicio.
   * @readonly
   */
  testimonials = this.dataService.testimonials;

  /**
   * Formatea un precio a formato colombiano (COP).
   * 
   * @method formatPrice
   * @param {number} price - Precio a formatear
   * @returns {string} Precio formateado
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Genera un array de estrellas según la calificación.
   * 
   * @method getStars
   * @param {number} rating - Calificación (1-5)
   * @returns {number[]} Array de tamaño igual a la parte entera del rating
   */
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  /**
   * Verifica si la calificación tiene media estrella.
   * 
   * @method hasHalfStar
   * @param {number} rating - Calificación a verificar
   * @returns {boolean} true si tiene decimal (media estrella)
   */
  hasHalfStar(rating: number): boolean {
    return rating % 1 !== 0;
  }
}

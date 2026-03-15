import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCategory, Product } from '../../core/models/product.model';

/**
 * Interfaz para los filtros del catálogo de productos.
 */
export interface ProductFilters {
  search: string;
  category: ProductCategory | 'all';
  priceRange: { min: number; max: number };
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'popular';
  onlyHot: boolean;
  onlyFeatured: boolean;
}

/**
 * Componente del catálogo de productos.
 * Permite buscar, filtrar y ordenar productos del inventario.
 * 
 * @component ProductsComponent
 * @description Proporciona una interfaz para explorar el catálogo de productos
 *              con filtros por categoría, precio, popularidad y estado destacado/hot.
 * 
 * @example
 * ```html
 * <app-products></app-products>
 * ```
 * 
 * @requires DataService
 */
@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  /** Servicio de datos para acceder a los productos */
  dataService = inject(DataService);

  /**
   * Signal con los filtros actuales de búsqueda.
   * @type {signal<ProductFilters>}
   */
  filters = signal<ProductFilters>({
    search: '',
    category: 'all',
    priceRange: { min: 0, max: 100000 },
    sortBy: 'popular',
    onlyHot: false,
    onlyFeatured: false
  });

  /**
   * Precio mínimo para el filtro de rango.
   * @type {signal<number>}
   */
  priceMin = signal(0);
  
  /**
   * Precio máximo para el filtro de rango.
   * @type {signal<number>}
   */
  priceMax = signal(100000);

  /**
   * Categorías disponibles para filtrar.
   * @type {Array<{id: string; name: string; icon: string}>}
   */
  categories = [
    { id: 'all' as const, name: 'Todos', icon: 'fa-solid fa-border-all' },
    { id: 'cafeteria' as const, name: 'Cafetería', icon: 'fa-solid fa-mug-hot' },
    { id: 'pizzeria' as const, name: 'Pizzería', icon: 'fa-solid fa-pizza-slice' },
    { id: 'despensa' as const, name: 'Despensa', icon: 'fa-solid fa-basket-shopping' },
    { id: 'combo' as const, name: 'Combos', icon: 'fa-solid fa-box-open' }
  ];

  /**
   * Opciones de ordenamiento disponibles.
   * @type {Array<{value: string; label: string}>}
   */
  sortOptions = [
    { value: 'popular', label: 'Más Populares' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price-asc', label: 'Menor Precio' },
    { value: 'price-desc', label: 'Mayor Precio' }
  ];

  /**
   * Computed con los productos filtrados según los filtros actuales.
   * @readonly
   */
  filteredProducts = computed(() => {
    let products = [...this.dataService.products()];
    const f = this.filters();

    if (f.search) {
      const search = f.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }

    if (f.category !== 'all') {
      products = products.filter(p => p.category === f.category);
    }

    products = products.filter(p => 
      p.price >= this.priceMin() && p.price <= this.priceMax()
    );

    if (f.onlyHot) {
      products = products.filter(p => p.isHot);
    }

    if (f.onlyFeatured) {
      products = products.filter(p => p.isFeatured);
    }

    switch (f.sortBy) {
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        products.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
        break;
    }

    return products;
  });

  /**
   * Computed con la cantidad de productos filtrados.
   * @readonly
   */
  productCount = computed(() => this.filteredProducts().length);

  /**
   * Actualiza el término de búsqueda.
   * 
   * @method updateSearch
   * @param {string} value - Término de búsqueda
   * @returns {void}
   */
  updateSearch(value: string): void {
    this.filters.update(f => ({ ...f, search: value }));
  }

  /**
   * Actualiza la categoría seleccionada.
   * 
   * @method updateCategory
   * @param {ProductCategory | 'all'} category - Categoría a filtrar
   * @returns {void}
   */
  updateCategory(category: ProductCategory | 'all'): void {
    this.filters.update(f => ({ ...f, category }));
  }

  /**
   * Actualiza el tipo de ordenamiento.
   * 
   * @method updateSort
   * @param {string} sortBy - Tipo de ordenamiento
   * @returns {void}
   */
  updateSort(sortBy: string): void {
    this.filters.update(f => ({ ...f, sortBy: sortBy as ProductFilters['sortBy'] }));
  }

  /**
   * Alterna el filtro de productos hot/populares.
   * 
   * @method toggleHot
   * @returns {void}
   */
  toggleHot(): void {
    this.filters.update(f => ({ ...f, onlyHot: !f.onlyHot }));
  }

  /**
   * Alterna el filtro de productos destacados.
   * 
   * @method toggleFeatured
   * @returns {void}
   */
  toggleFeatured(): void {
    this.filters.update(f => ({ ...f, onlyFeatured: !f.onlyFeatured }));
  }

  /**
   * Actualiza el rango de precios con los valores actuales.
   * 
   * @method updatePriceRange
   * @returns {void}
   */
  updatePriceRange(): void {
    this.filters.update(f => ({ 
      ...f, 
      priceRange: { min: this.priceMin(), max: this.priceMax() } 
    }));
  }

  /**
   * Reinicia todos los filtros a sus valores por defecto.
   * 
   * @method resetFilters
   * @returns {void}
   */
  resetFilters(): void {
    this.filters.set({
      search: '',
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      sortBy: 'popular',
      onlyHot: false,
      onlyFeatured: false
    });
    this.priceMin.set(0);
    this.priceMax.set(100000);
  }

  /**
   * Formatea un precio a formato colombiano.
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
   * Verifica si hay filtros activos selain del默认值.
   * 
   * @method hasActiveFilters
   * @returns {boolean} true si hay filtros activos
   */
  hasActiveFilters(): boolean {
    const f = this.filters();
    return f.search !== '' || 
           f.category !== 'all' || 
           f.onlyHot || 
           f.onlyFeatured ||
           this.priceMin() > 0 || 
           this.priceMax() < 100000;
  }
}

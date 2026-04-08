export interface ProductModel {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;  // Permite categorías dinámicas
  image: string;
  isFeatured: boolean;
  isHot: boolean;
  isCombo: boolean;
  stock: number;
  averageRating?: number;
  totalReviews?: number;
}

// Tipo para categorías fijas legacy (backwards compatibility)
export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo' | string;

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
}

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

export interface ProductFilters {
  search: string;
  category: string | 'all';  // Permite categorías dinámicas
  priceRange: { min: number; max: number };
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'popular';
  onlyHot: boolean;
  onlyFeatured: boolean;
  minRating: number;
}

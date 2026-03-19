export interface ProductModel {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  isFeatured: boolean;
  isHot: boolean;
  isCombo: boolean;
  stock: number;
  averageRating?: number;
  totalReviews?: number;
}

export type ProductCategory = 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';

export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  image: string;
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
  category: ProductCategory | 'all';
  priceRange: { min: number; max: number };
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'popular';
  onlyHot: boolean;
  onlyFeatured: boolean;
  minRating: number;
}

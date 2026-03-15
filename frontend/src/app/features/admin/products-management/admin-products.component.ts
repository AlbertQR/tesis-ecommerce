import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductCategory } from '../../../core/models/product.model';

interface Product {
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
}

@Component({
  selector: 'app-admin-products',
  imports: [FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  products = signal<Product[]>([]);
  categoryFilter = signal<'all' | ProductCategory | 'combo'>('all');
  searchTerm = signal('');
  isEditing = signal(false);
  editingProduct = signal<Product | null>(null);
  isLoading = signal(false);

  formData: Product = {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'cafeteria',
    image: '',
    isFeatured: false,
    isHot: false,
    isCombo: false,
    stock: 0
  };

  categories = [
    { id: 'cafeteria', name: 'Cafetería' },
    { id: 'pizzeria', name: 'Pizzería' },
    { id: 'despensa', name: 'Despensa' },
    { id: 'combo', name: 'Combo' }
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filteredProducts(): Product[] {
    let result = this.products();
    if (this.categoryFilter() !== 'all') {
      result = result.filter(p => p.category === this.categoryFilter());
    }
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(search));
    }
    return result;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = { cafeteria: 'Cafetería', pizzeria: 'Pizzería', despensa: 'Despensa', combo: 'Combo' };
    return labels[category] || category;
  }

  getCategoryClass(category: string): string {
    const classes: Record<string, string> = {
      cafeteria: 'bg-brown-100 text-brown-800',
      pizzeria: 'bg-red-100 text-red-800',
      despensa: 'bg-green-100 text-green-800',
      combo: 'bg-purple-100 text-purple-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600 font-bold';
    if (stock < 10) return 'text-orange-600 font-bold';
    return 'text-green-600';
  }

  startAdd(): void {
    this.formData = {
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'cafeteria',
      image: '/imgs/photo-1574071318508-1cdbab80d002.jfif',
      isFeatured: false,
      isHot: false,
      isCombo: false,
      stock: 0
    };
    this.editingProduct.set(null);
    this.isEditing.set(true);
  }

  startEdit(product: Product): void {
    this.formData = { ...product };
    this.editingProduct.set(product);
    this.isEditing.set(true);
  }

  save(): void {
    if (this.editingProduct()) {
      this.http.put<Product>(`${this.apiUrl}/products/${this.formData.id}`, this.formData).subscribe({
        next: (updated) => {
          this.products.update(list => 
            list.map(p => p.id === updated.id ? updated : p)
          );
          this.isEditing.set(false);
        }
      });
    } else {
      this.http.post<Product>(`${this.apiUrl}/products`, this.formData).subscribe({
        next: (created) => {
          this.products.update(list => [...list, created]);
          this.isEditing.set(false);
        }
      });
    }
  }

  deleteProduct(id: string): void {
    if (confirm('¿Eliminar este producto?')) {
      this.http.delete(`${this.apiUrl}/products/${id}`).subscribe({
        next: () => {
          this.products.update(list => list.filter(p => p.id !== id));
        }
      });
    }
  }

  toggleFeatured(id: string): void {
    const product = this.products().find(p => p.id === id);
    if (product) {
      this.http.put<Product>(`${this.apiUrl}/products/${id}`, { isFeatured: !product.isFeatured }).subscribe({
        next: (updated) => {
          this.products.update(list => list.map(p => p.id === id ? updated : p));
        }
      });
    }
  }

  toggleHot(id: string): void {
    const product = this.products().find(p => p.id === id);
    if (product) {
      this.http.put<Product>(`${this.apiUrl}/products/${id}`, { isHot: !product.isHot }).subscribe({
        next: (updated) => {
          this.products.update(list => list.map(p => p.id === id ? updated : p));
        }
      });
    }
  }

  updateStock(id: string, change: number): void {
    const product = this.products().find(p => p.id === id);
    if (product) {
      const newStock = Math.max(0, product.stock + change);
      this.http.put<Product>(`${this.apiUrl}/products/${id}`, { stock: newStock }).subscribe({
        next: (updated) => {
          this.products.update(list => list.map(p => p.id === id ? updated : p));
        }
      });
    }
  }
}

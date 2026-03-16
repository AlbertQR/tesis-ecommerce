import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductCategory, ProductModel } from '@core/models';
import { FormatPricePipe } from '@shared/pipes';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-admin-products',
  imports: [FormsModule, FormatPricePipe],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  products = signal<ProductModel[]>([]);
  categoryFilter = signal<'all' | ProductCategory | 'combo'>('all');
  searchTerm = signal('');
  isEditing = signal(false);
  editingProduct = signal<ProductModel | null>(null);
  isLoading = signal(false);
  isUploading = signal(false);
  formData: ProductModel = {
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
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.http.get<ProductModel[]>(`${this.apiUrl}/products`).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filteredProducts(): ProductModel[] {
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

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      cafeteria: 'Cafetería',
      pizzeria: 'Pizzería',
      despensa: 'Despensa',
      combo: 'Combo'
    };
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

  startEdit(product: ProductModel): void {
    this.formData = { ...product };
    this.editingProduct.set(product);
    this.isEditing.set(true);
  }

  save(): void {
    if (this.editingProduct()) {
      this.http.put<ProductModel>(`${this.apiUrl}/products/${this.formData.id}`, this.formData).subscribe({
        next: (updated) => {
          this.products.update(list =>
            list.map(p => p.id === updated.id ? updated : p)
          );
          this.isEditing.set(false);
        }
      });
    } else {
      this.http.post<ProductModel>(`${this.apiUrl}/products`, this.formData).subscribe({
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
      this.http.put<ProductModel>(`${this.apiUrl}/products/${id}`, { isFeatured: !product.isFeatured }).subscribe({
        next: (updated) => {
          this.products.update(list => list.map(p => p.id === id ? updated : p));
        }
      });
    }
  }

  toggleHot(id: string): void {
    const product = this.products().find(p => p.id === id);
    if (product) {
      this.http.put<ProductModel>(`${this.apiUrl}/products/${id}`, { isHot: !product.isHot }).subscribe({
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
      this.http.put<ProductModel>(`${this.apiUrl}/products/${id}`, { stock: newStock }).subscribe({
        next: (updated) => {
          this.products.update(list => list.map(p => p.id === id ? updated : p));
        }
      });
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadImage(input.files[0]);
    }
  }

  uploadImage(file: File): void {
    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true
    }).subscribe({
      next: (response) => {
        this.formData.image = response.url;
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.isUploading.set(false);
        alert('Error al subir la imagen');
      }
    });
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private http = inject(HttpClient);
  
  // Estado reactivo
  private _categories = signal<Category[]>([]);
  readonly categories = this._categories.asReadonly();
  
  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();
  
  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  loadCategories(): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.http.get<Category[]>(this.apiUrl).subscribe({
      next: (data) => {
        this._categories.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set('Error al cargar categorías');
        this._isLoading.set(false);
      }
    });
  }

  createCategory(data: Omit<Category, 'id'>): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.http.post<Category>(this.apiUrl, data).subscribe({
      next: (created) => {
        this._categories.update(cats => [...cats, created]);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set('Error al crear categoría');
        this._isLoading.set(false);
      }
    });
  }

  updateCategory(id: string, data: Omit<Category, 'id'>): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.http.put<Category>(`${this.apiUrl}/${id}`, data).subscribe({
      next: (updated) => {
        this._categories.update(cats => 
          cats.map(c => c.id === id ? updated : c)
        );
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set('Error al actualizar categoría');
        this._isLoading.set(false);
      }
    });
  }

  deleteCategory(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this._categories.update(cats => cats.filter(c => c.id !== id));
        this._isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 400) {
          this._error.set('No se puede eliminar: tiene productos asociados');
        } else {
          this._error.set('Error al eliminar categoría');
        }
        this._isLoading.set(false);
      }
    });
  }

  clearError(): void {
    this._error.set(null);
  }
}
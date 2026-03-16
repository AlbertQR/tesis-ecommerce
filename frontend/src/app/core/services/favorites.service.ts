import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { ProductModel } from '../models/product.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private http = inject(HttpClient);
  private favoriteIdsSignal = signal<string[]>([]);
  readonly favoriteIds = this.favoriteIdsSignal.asReadonly();
  readonly favoriteCount = computed(() => this.favoriteIds().length);

  readonly favorites = computed(() => {
    const ids = this.favoriteIds();
    const products = this.dataService.products();
    return products.filter(p => ids.includes(p.id));
  });

  constructor() {
    this.loadFavorites();
  }

  loadFavorites(): void {
    if (this.authService.isAuthenticated()) {
      this.http.get<string[]>(`${this.apiUrl}/users/favorites`).pipe(
        tap(favorites => this.favoriteIdsSignal.set(favorites || []))
      ).subscribe();
    } else {
      this.favoriteIdsSignal.set([]);
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().includes(productId);
  }

  toggleFavorite(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const isFav = this.isFavorite(productId);
    
    if (isFav) {
      this.http.delete<string[]>(`${this.apiUrl}/users/favorites/${productId}`).pipe(
        tap(favorites => this.favoriteIdsSignal.set(favorites))
      ).subscribe();
    } else {
      this.http.post<string[]>(`${this.apiUrl}/users/favorites`, { productId }).pipe(
        tap(favorites => this.favoriteIdsSignal.set(favorites))
      ).subscribe();
    }
  }

  addFavorite(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (!this.isFavorite(productId)) {
      this.http.post<string[]>(`${this.apiUrl}/users/favorites`, { productId }).pipe(
        tap(favorites => this.favoriteIdsSignal.set(favorites))
      ).subscribe();
    }
  }

  removeFavorite(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.http.delete<string[]>(`${this.apiUrl}/users/favorites/${productId}`).pipe(
      tap(favorites => this.favoriteIdsSignal.set(favorites))
    ).subscribe();
  }
}

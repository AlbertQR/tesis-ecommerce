import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Category as CategoryModel,
  Combo as ComboModel,
  ProductModel as ProductModel,
  Testimonial as TestimonialModel
} from '../models/product.model';
import { tap } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private productsSignal = signal<ProductModel[]>([]);
  readonly products = this.productsSignal.asReadonly();
  private categoriesSignal = signal<CategoryModel[]>([]);
  readonly categories = this.categoriesSignal.asReadonly();
  private testimonialsSignal = signal<TestimonialModel[]>([]);
  readonly testimonials = this.testimonialsSignal.asReadonly();
  private comboSignal = signal<ComboModel | null>(null);
  readonly featuredCombo = this.comboSignal.asReadonly();
  private http = inject(HttpClient);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.http.get<ProductModel[]>(`${this.apiUrl}/products`).pipe(
      tap(products => this.productsSignal.set(products))
    ).subscribe();

    this.http.get<CategoryModel[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => this.categoriesSignal.set(categories))
    ).subscribe();

    this.http.get<TestimonialModel[]>(`${this.apiUrl}/testimonials`).pipe(
      tap(testimonials => this.testimonialsSignal.set(testimonials))
    ).subscribe();

    this.http.get<ComboModel[]>(`${this.apiUrl}/combos?featured=true`).pipe(
      tap(combos => this.comboSignal.set(combos[0] || null))
    ).subscribe();
  }
}

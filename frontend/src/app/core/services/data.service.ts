import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Category as CategoryModel,
  Combo as ComboModel,
  ProductModel as ProductModel,
  Testimonial as TestimonialModel
} from '@core/models';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    forkJoin({
      products: this.http.get<ProductModel[]>(`${this.apiUrl}/products`),
      categories: this.http.get<CategoryModel[]>(`${this.apiUrl}/categories`),
      testimonials: this.http.get<TestimonialModel[]>(`${this.apiUrl}/testimonials`),
      combos: this.http.get<ComboModel[]>(`${this.apiUrl}/combos?featured=true`)
    }).pipe(
      tap(({ products, categories, testimonials, combos }) => {
        this.productsSignal.set(products);
        this.categoriesSignal.set(categories);
        this.testimonialsSignal.set(testimonials);
        this.comboSignal.set(combos[0] || null);
      })
    ).subscribe();
  }
}

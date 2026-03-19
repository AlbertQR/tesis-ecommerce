import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ProductModel as ProductModel,
  ProductCategory as ProductCategoryModel
} from '../models/product.model';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

const DELIVERY_FEE = 100;

export interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategoryModel;
  image: string;
  isFeatured: boolean;
  isHot: boolean;
  isCombo: boolean;
  stock: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface CartItemResponse {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export type ProductCategory = ProductCategoryModel;

export type PaymentMethod = 'cash' | 'enzona';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  readonly hasDelivery = signal(false);
  readonly paymentMethod = signal<PaymentMethod>('cash');
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);
  private items = signal<CartItem[]>([]);
  readonly cartItems = this.items.asReadonly();
  readonly cartCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );
  private deliveryFeeSignal = signal(DELIVERY_FEE);
  readonly deliveryFee = computed(() =>
    this.hasDelivery() ? this.deliveryFeeSignal() : 0
  );
  readonly cartTotal = computed(() =>
    this.subtotal() + this.deliveryFee()
  );
  private http = inject(HttpClient);

  constructor() {
    this.loadCart();
  }

  toggleDelivery(): void {
    this.hasDelivery.update(v => !v);
  }

  addToCart(product: ProductModel): boolean {
    if (!this.authService.isAuthenticated()) return false;

    this.http.post<{ items: CartItemResponse[] }>(`${this.apiUrl}/cart`, {
      productId: product.id,
      quantity: 1
    }).pipe(
      tap(response => this.items.set(this.transformItems(response.items)))
    ).subscribe();

    return true;
  }

  removeFromCart(productId: string): void {
    if (!this.authService.isAuthenticated()) return;

    this.http.delete<{ items: CartItemResponse[] }>(`${this.apiUrl}/cart/${productId}`)
      .pipe(tap(response => this.items.set(this.transformItems(response.items)))
    ).subscribe();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (!this.authService.isAuthenticated()) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.http.put<{
      items: CartItemResponse[]
    }>(`${this.apiUrl}/cart/${productId}`, { quantity }).pipe(
      tap(response => this.items.set(this.transformItems(response.items)))
    ).subscribe();
  }

  clearCart(): void {
    if (!this.authService.isAuthenticated()) return;

    this.http.delete(`${this.apiUrl}/cart`).pipe(
      tap(() => this.items.set([]))
    ).subscribe();
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  checkout(addressId: string, hasDelivery: boolean) {
    const paymentMethod = this.paymentMethod();
    return this.http.post<any>(`${this.apiUrl}/checkout`, {
      addressId,
      hasDelivery,
      paymentMethod
    }).pipe(
      tap(() => {
        // Only clear cart immediately for cash payments
        // For EnZona, cart is cleared after successful payment
        if (paymentMethod === 'cash') this.items.set([]);
      })
    );
  }

  private loadCart(): void {
    if (this.authService.isAuthenticated()) {
      this.http.get<{ items: CartItemResponse[]; deliveryFee: number }>(`${this.apiUrl}/cart`).pipe(
        tap(response => {
          const items = response.items.map(item => ({
            product: {
              id: item.productId,
              name: item.productName,
              image: item.productImage,
              price: item.unitPrice,
              description: '',
              category: item.category as ProductCategoryModel,
              isFeatured: false,
              isHot: false,
              isCombo: false,
              stock: 0
            },
            quantity: item.quantity
          }));
          this.items.set(items);
          this.deliveryFeeSignal.set(response.deliveryFee);
        }),
        catchError(() => of({ items: [], deliveryFee: DELIVERY_FEE }))
      ).subscribe();
    }
  }

  private transformItems(items: CartItemResponse[]): CartItem[] {
    return items.map(item => ({
      product: {
        id: item.productId,
        name: item.productName,
        image: item.productImage,
        price: item.unitPrice,
        description: '',
        category: item.category as ProductCategoryModel,
        isFeatured: false,
        isHot: false,
        isCombo: false,
        stock: 0
      },
      quantity: item.quantity
    }));
  }
}

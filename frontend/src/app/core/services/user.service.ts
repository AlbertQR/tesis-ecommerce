import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Address as AddressModel,
  Order as OrderModel,
  OrderStatus as OrderStatusModel,
  UserModel as UserModel
} from '../models/user.model';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = environment.usersEndpoint;
  private ordersApiUrl = environment.ordersEndpoint;
  private authService = inject(AuthService);
  private userProfileSignal = signal<UserModel | null>(null);
  readonly user = computed(() => this.userProfileSignal());
  private addressesSignal = signal<AddressModel[]>([]);
  readonly addresses = this.addressesSignal.asReadonly();
  readonly defaultAddress = computed(() =>
    this.addressesSignal().find(a => a.isDefault) || this.addressesSignal()[0]
  );
  private ordersSignal = signal<OrderModel[]>([]);
  readonly orders = this.ordersSignal.asReadonly();
  readonly pendingOrders = computed(() =>
    this.ordersSignal().filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status as string))
  );
  readonly completedOrders = computed(() =>
    this.ordersSignal().filter(o => o.status === 'delivered')
  );
  private http = inject(HttpClient);

  constructor() {
    this.loadData();
  }

  loadAddresses(): void {
    this.http.get<AddressModel[]>(`${this.usersUrl}/addresses`).pipe(
      tap(addresses => this.addressesSignal.set(addresses)),
      catchError(() => of([]))
    ).subscribe();
  }

  loadOrders(): void {
    this.http.get<OrderModel[]>(`${this.ordersApiUrl}`).pipe(
      tap(orders => this.ordersSignal.set(orders)),
      catchError(() => of([]))
    ).subscribe();
  }

  downloadInvoice(orderId: string): void {
    const token = localStorage.getItem('token');
    if (token) {
      window.open(`${this.ordersApiUrl}/${orderId}/invoice?token=${token}`, '_blank');
    }
  }

  cancelOrder(orderId: string): void {
    this.http.delete<OrderModel>(`${this.ordersApiUrl}/${orderId}`).pipe(
      tap(() => {
        this.loadOrders();
      }),
      catchError(() => of(null))
    ).subscribe();
  }

  updateUser(data: { name?: string; phone?: string; avatar?: string }): void {
    this.http.put<any>(`${this.usersUrl}/profile`, data).pipe(
      tap(user => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...user }));
        this.authService.refreshUser().subscribe();
      })
    ).subscribe();
  }

  addAddress(address: Omit<AddressModel, 'id'>): void {
    this.http.post<AddressModel>(`${this.usersUrl}/addresses`, address).pipe(
      tap(newAddress => {
        this.addressesSignal.update(addresses => [...addresses, newAddress]);
      })
    ).subscribe();
  }

  updateAddress(id: string, address: Partial<AddressModel>): void {
    this.http.put<AddressModel>(`${this.usersUrl}/addresses/${id}`, address).pipe(
      tap(updated => {
        this.addressesSignal.update(addresses =>
          addresses.map(a => a.id === id ? updated : a)
        );
      })
    ).subscribe();
  }

  deleteAddress(id: string): void {
    this.http.delete(`${this.usersUrl}/addresses/${id}`).pipe(
      tap(() => {
        this.addressesSignal.update(addresses => addresses.filter(a => a.id !== id));
      })
    ).subscribe();
  }

  setDefaultAddress(id: string): void {
    this.http.put<AddressModel>(`${this.usersUrl}/addresses/${id}/default`, {}).pipe(
      tap(() => {
        this.addressesSignal.update(addresses =>
          addresses.map(a => ({
            ...a,
            isDefault: a.id === id
          }))
        );
      })
    ).subscribe();
  }

  getStatusLabel(status: OrderStatusModel): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo para entregar',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status as string] || status as string;
  }

  getStatusClass(status: OrderStatusModel): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status as string] || '';
  }

  private loadData(): void {
    if (this.authService.isAuthenticated()) {
      this.loadUserProfile();
      this.loadAddresses();
      this.loadOrders();
    }
  }

  loadUserProfile(): void {
    this.http.get<{ user: UserModel }>(`${this.usersUrl}/profile`).pipe(
      tap(response => this.userProfileSignal.set(response.user)),
      catchError(() => of(null))
    ).subscribe();
  }
}

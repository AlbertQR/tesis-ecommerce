import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address, Order, OrderStatus, User } from '../models/user.model';
import { tap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Servicio para gestionar datos del usuario como direcciones y pedidos.
 * Utiliza signals para mantener el estado reactivo.
 * 
 * @service UserService
 * @description Proporciona métodos para cargar y gestionar direcciones de entrega,
 *              pedidos del usuario, y información del perfil. Se integra con AuthService
 *              para obtener el estado de autenticación.
 * 
 * @example
 * ```typescript
 * constructor(private userService: UserService) {
 *   const addresses = this.userService.addresses();
 *   const orders = this.userService.orders();
 * }
 * ```
 * 
 * @requires HttpClient
 * @requires AuthService
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /** URL base del API de usuarios */
  private apiUrl = 'http://localhost:3000/api/users';
  
  /** Inyección del servicio de autenticación */
  private authService = inject(AuthService);
  
  /** Signal para almacenar las direcciones del usuario */
  private addressesSignal = signal<Address[]>([]);
  
  /** Signal para almacenar los pedidos del usuario */
  private ordersSignal = signal<Order[]>([]);
  
  /** Computed signal con los datos del usuario desde AuthService */
  readonly user = computed(() => this.authService.user() as User | null);
  
  /** Referencia de solo lectura al signal de direcciones */
  readonly addresses = this.addressesSignal.asReadonly();
  
  /** Referencia de solo lectura al signal de pedidos */
  readonly orders = this.ordersSignal.asReadonly();

  /**
   * Computed signal que retorna la dirección por defecto.
   * Si no hay una marcada como default, retorna la primera dirección.
   * 
   * @readonly
   */
  readonly defaultAddress = computed(() => 
    this.addressesSignal().find(a => a.isDefault) || this.addressesSignal()[0]
  );

  /**
   * Computed signal que retorna los pedidos pendientes o en proceso.
   * 
   * @readonly
   */
  readonly pendingOrders = computed(() => 
    this.ordersSignal().filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status as string))
  );

  /**
   * Computed signal que retorna los pedidos completados/entregados.
   * 
   * @readonly
   */
  readonly completedOrders = computed(() => 
    this.ordersSignal().filter(o => o.status === 'delivered')
  );

  /**
   * Constructor del servicio.
   * Inicia la carga de datos si el usuario está autenticado.
   * 
   * @param {HttpClient} http - Cliente HTTP de Angular
   */
  constructor(private http: HttpClient) {
    this.loadData();
  }

  /**
   * Carga las direcciones y pedidos del usuario.
   * Solo se ejecuta si el usuario está autenticado.
   * 
   * @method loadData
   * @private
   */
  private loadData(): void {
    if (this.authService.isAuthenticated()) {
      this.loadAddresses();
      this.loadOrders();
    }
  }

  /**
   * Carga las direcciones del usuario desde el API.
   * 
   * @method loadAddresses
   * @returns {void}
   */
  loadAddresses(): void {
    this.http.get<Address[]>(`${this.apiUrl}/addresses`).pipe(
      tap(addresses => this.addressesSignal.set(addresses)),
      catchError(() => of([]))
    ).subscribe();
  }

  /**
   * Carga los pedidos del usuario desde el API.
   * 
   * @method loadOrders
   * @returns {void}
   */
  loadOrders(): void {
    this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      tap(orders => this.ordersSignal.set(orders)),
      catchError(() => of([]))
    ).subscribe();
  }

  /**
   * Actualiza los datos del perfil del usuario.
   * 
   * @method updateUser
   * @param {object} data - Datos a actualizar (name, phone, avatar)
   * @returns {void}
   */
  updateUser(data: { name?: string; phone?: string; avatar?: string }): void {
    this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap(user => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...user }));
        this.authService.refreshUser().subscribe();
      })
    ).subscribe();
  }

  /**
   * Agrega una nueva dirección de entrega.
   * 
   * @method addAddress
   * @param {Omit<Address, 'id'>} address - Datos de la nueva dirección
   * @returns {void}
   */
  addAddress(address: Omit<Address, 'id'>): void {
    this.http.post<Address>(`${this.apiUrl}/addresses`, address).pipe(
      tap(newAddress => {
        this.addressesSignal.update(addresses => [...addresses, newAddress]);
      })
    ).subscribe();
  }

  /**
   * Actualiza una dirección existente.
   * 
   * @method updateAddress
   * @param {string} id - ID de la dirección a actualizar
   * @param {Partial<Address>} address - Datos a actualizar
   * @returns {void}
   */
  updateAddress(id: string, address: Partial<Address>): void {
    this.http.put<Address>(`${this.apiUrl}/addresses/${id}`, address).pipe(
      tap(updated => {
        this.addressesSignal.update(addresses => 
          addresses.map(a => a.id === id ? updated : a)
        );
      })
    ).subscribe();
  }

  /**
   * Elimina una dirección de entrega.
   * 
   * @method deleteAddress
   * @param {string} id - ID de la dirección a eliminar
   * @returns {void}
   */
  deleteAddress(id: string): void {
    this.http.delete(`${this.apiUrl}/addresses/${id}`).pipe(
      tap(() => {
        this.addressesSignal.update(addresses => addresses.filter(a => a.id !== id));
      })
    ).subscribe();
  }

  /**
   * Establece una dirección como predeterminada.
   * 
   * @method setDefaultAddress
   * @param {string} id - ID de la dirección a establecer como default
   * @returns {void}
   */
  setDefaultAddress(id: string): void {
    this.http.put<Address>(`${this.apiUrl}/addresses/${id}/default`, {}).pipe(
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

  /**
   * Obtiene la etiqueta legible del estado de un pedido.
   * 
   * @method getStatusLabel
   * @param {OrderStatus} status - Estado del pedido
   * @returns {string} Etiqueta en español del estado
   */
  getStatusLabel(status: OrderStatus): string {
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

  /**
   * Obtiene las clases CSS para el estado de un pedido.
   * 
   * @method getStatusClass
   * @param {OrderStatus} status - Estado del pedido
   * @returns {string} Clases CSS para el badge del estado
   */
  getStatusClass(status: OrderStatus): string {
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
}

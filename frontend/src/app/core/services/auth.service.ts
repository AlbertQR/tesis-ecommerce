import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';

/**
 * Interfaz que define la estructura de un usuario.
 * 
 * @interface User
 * 
 * @property {string} id - Identificador único del usuario
 * @property {string} email - Correo electrónico del usuario
 * @property {string} name - Nombre completo del usuario
 * @property {string} phone - Número de teléfono
 * @property {string} [avatar] - URL opcional de la foto de perfil
 * @property {'user' | 'admin'} role - Rol del usuario en el sistema
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin';
}

/**
 * Interfaz que define la respuesta de autenticación.
 * 
 * @interface AuthResponse
 * 
 * @property {User} user - Datos del usuario autenticado
 * @property {string} token - Token JWT de autenticación
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Servicio de autenticación para gestionar el login, registro y logout de usuarios.
 * Utiliza signals para mantener el estado reactivo de la autenticación.
 * 
 * @service AuthService
 * @description Proporciona métodos para iniciar sesión, registrar usuarios, cerrar sesión
 *              y verificar el estado de autenticación. Mantiene el token y datos del usuario
 *              en localStorage para persistencia entre sesiones.
 * 
 * @example
 * ```typescript
 * // Iniciar sesión
 * this.authService.login('email@test.com', 'password').subscribe();
 * 
 * // Verificar si está autenticado
 * if (this.authService.isAuthenticated()) { ... }
 * 
 * // Cerrar sesión
 * this.authService.logout();
 * ```
 * 
 * @requires HttpClient
 * @requires Router
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** URL base del API de autenticación */
  private apiUrl = 'http://localhost:3000/api/auth';
  
  /** Signal para almacenar los datos del usuario */
  private userSignal = signal<User | null>(null);
  
  /** Signal para almacenar el token JWT */
  private tokenSignal = signal<string | null>(null);

  /** Referencia de solo lectura al signal de usuario */
  readonly user = this.userSignal.asReadonly();
  
  /**
   * Computed signal que indica si el usuario está autenticado.
   * Retorna true si existe un token válido.
   * 
   * @readonly
   * @type {computed<boolean>}
   */
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  
  /**
   * Computed signal que indica si el usuario es administrador.
   * Retorna true si el rol del usuario es 'admin'.
   * 
   * @readonly
   * @type {computed<boolean>}
   */
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  /**
   * Constructor del servicio.
   * Inicializa el servicio cargando datos desde localStorage.
   * 
   * @param {HttpClient} http - Cliente HTTP de Angular para realizar peticiones
   * @param {Router} router - Router de Angular para navegación
   */
  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  /**
   * Carga el token y datos del usuario desde localStorage.
   * Se ejecuta automáticamente al iniciar el servicio.
   * 
   * @method loadFromStorage
   * @private
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSignal.set(token);
      this.userSignal.set(JSON.parse(user));
    }
  }

  /**
   * Obtiene el token JWT actual.
   * 
   * @method getToken
   * @returns {string | null} El token JWT o null si no está autenticado
   * 
   * @example
   * ```typescript
   * const token = this.authService.getToken();
   * ```
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Inicia sesión con email y contraseña.
   * 
   * @method login
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Observable<AuthResponse>} Observable con la respuesta de autenticación
   * 
   * @example
   * ```typescript
   * this.authService.login('email@test.com', 'password123')
   *   .subscribe({
   *     next: (response) => console.log('Login exitoso'),
   *     error: (err) => console.error('Error en login')
   *   });
   * ```
   */
  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        this.userSignal.set(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * 
   * @method register
   * @param {string} name - Nombre completo del usuario
   * @param {string} email - Correo electrónico del usuario
   * @param {string} phone - Número de teléfono
   * @param {string} password - Contraseña del usuario
   * @returns {Observable<AuthResponse>} Observable con la respuesta de autenticación
   * 
   * @example
   * ```typescript
   * this.authService.register('Juan Perez', 'juan@test.com', '+573001234567', 'password123')
   *   .subscribe({
   *     next: (response) => console.log('Registro exitoso')
   *   });
   * ```
   */
  register(name: string, email: string, phone: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, phone, password }).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        this.userSignal.set(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual.
   * Limpia los signals y localStorage, y navega a la página principal.
   * 
   * @method logout
   * @returns {void}
   * 
   * @example
   * ```typescript
   * this.authService.logout();
   * ```
   */
  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  /**
   * Actualiza los datos del usuario desde el servidor.
   * 
   * @method refreshUser
   * @returns {Observable<User>} Observable con los datos actualizados del usuario
   * 
   * @example
   * ```typescript
   * this.authService.refreshUser().subscribe(user => {
   *   console.log('Usuario actualizado:', user);
   * });
   * ```
   */
  refreshUser() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.userSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }
}

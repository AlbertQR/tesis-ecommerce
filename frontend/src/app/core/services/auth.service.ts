import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

/**
 * Interfaz que define la estructura del payload del JWT.
 * 
 * @interface JwtPayload
 */
interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

/**
 * Interfaz que define la estructura de un usuario.
 * 
 * @interface User
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
}

/**
 * Interfaz que define la respuesta de autenticación.
 * 
 * @interface AuthResponse
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Servicio de autenticación para gestionar el login, registro y logout de usuarios.
 * Utiliza signals para mantener el estado reactivo y decodifica el JWT para obtener datos del usuario.
 * 
 * @service AuthService
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  readonly user = this.userSignal.asReadonly();
  
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && this.isTokenValid());
  
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenSignal.set(token);
      this.decodeToken(token);
    }
  }

  private decodeToken(token: string): void {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const user: User = {
        id: payload.id,
        email: payload.email,
        role: payload.role
      };
      this.userSignal.set(user);
    } catch {
      this.tokenSignal.set(null);
      this.userSignal.set(null);
      localStorage.removeItem('token');
    }
  }

  private isTokenValid(): boolean {
    const token = this.tokenSignal();
    if (!token) return false;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.exp) {
        return Date.now() < payload.exp * 1000;
      }
      return true;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        localStorage.setItem('token', response.token);
        this.decodeToken(response.token);
      })
    );
  }

  register(name: string, email: string, phone: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, phone, password }).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        localStorage.setItem('token', response.token);
        this.decodeToken(response.token);
      })
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  refreshUser() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.userSignal.set(user);
      })
    );
  }
}

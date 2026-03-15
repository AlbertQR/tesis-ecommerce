import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '@environments/environment';
import { UserModel } from '@core/models';

interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: UserModel;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.authEndpoint;

  private userSignal = signal<UserModel | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');
  private tokenSignal = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && this.isTokenValid());
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.loadFromStorage();
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      name,
      email,
      phone,
      password
    }).pipe(
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
    this.router.navigate(['/']).then(() => {});
  }

  refreshUser() {
    return this.http.get<UserModel>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.userSignal.set(user);
      })
    );
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
      const user: UserModel = {
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
}

import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Componente de autenticación para login y registro de usuarios.
 * Permite a los usuarios iniciar sesión o crear una nueva cuenta.
 * 
 * @component AuthComponent
 * @description Gestiona el formulario de login y registro con validación
 *              básica y comunicación con AuthService. Cambia entre modos
 *              de login y registro dinámicamente.
 * 
 * @example
 * ```html
 * <app-auth></app-auth>
 * ```
 * 
 * @requires AuthService
 * @requires Router
 */
@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  /** Servicio de autenticación para gestionar login/registro */
  private authService = inject(AuthService);
  
  /** Router para navegación después de autenticación exitosa */
  private router = inject(Router);
  
  /**
   * Signal que indica el modo actual del componente.
   * true = modo login, false = modo registro.
   * @type {signal<boolean>}
   */
  isLogin = signal(true);
  
  /**
   * Signal que indica si hay una operación en progreso.
   * @type {signal<boolean>}
   */
  isLoading = signal(false);
  
  /**
   * Signal para almacenar mensajes de error.
   * @type {signal<string>}
   */
  error = signal('');

  /**
   * Datos del formulario de login.
   * @type {{ email: string; password: string }}
   */
  loginForm = {
    email: '',
    password: ''
  };

  /**
   * Datos del formulario de registro.
   * @type {{ name: string; email: string; phone: string; password: string; confirmPassword: string }}
   */
  registerForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  /**
   * Alterna entre modo login y modo registro.
   * Limpia el mensaje de error al cambiar de modo.
   * 
   * @method toggleMode
   * @returns {void}
   */
  toggleMode(): void {
    this.isLogin.update(v => !v);
    this.error.set('');
  }

  /**
   * Procesa el inicio de sesión.
   * Valida credenciales y navega al perfil si es exitoso.
   * 
   * @method onLogin
   * @returns {void}
   */
  onLogin(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.authService.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: () => {
        this.router.navigate(['/perfil']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al iniciar sesión');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Procesa el registro de un nuevo usuario.
   * Valida que los campos estén completos y las contraseñas coincidan.
   * 
   * @method onRegister
   * @returns {void}
   */
  onRegister(): void {
    this.isLoading.set(true);
    this.error.set('');

    if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password) {
      this.error.set('Por favor completa todos los campos');
      this.isLoading.set(false);
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      this.isLoading.set(false);
      return;
    }

    this.authService.register(
      this.registerForm.name,
      this.registerForm.email,
      this.registerForm.phone,
      this.registerForm.password
    ).subscribe({
      next: () => {
        this.router.navigate(['/perfil']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al registrar usuario');
        this.isLoading.set(false);
      }
    });
  }
}

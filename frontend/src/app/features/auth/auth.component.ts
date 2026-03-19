import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLogin = signal(true);
  showForgotPassword = signal(false);
  isLoading = signal(false);
  error = signal('');
  successMessage = signal('');
  forgotEmail = '';
  resetPassword = '';
  resetConfirmPassword = '';
  resetToken = '';
  loginForm = {
    email: '',
    password: ''
  };
  registerForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.isLogin.set(false);
      }
    });
  }

  get currentMode(): AuthMode {
    if (this.resetToken) return 'reset';
    if (this.showForgotPassword()) return 'forgot';
    if (!this.isLogin()) return 'register';
    return 'login';
  }

  toggleMode(): void {
    this.isLogin.update(v => !v);
    this.error.set('');
    this.successMessage.set('');
  }

  showForgot(): void {
    this.showForgotPassword.set(true);
    this.error.set('');
    this.successMessage.set('');
  }

  backToLogin(): void {
    this.isLogin.set(true);
    this.showForgotPassword.set(false);
    this.error.set('');
    this.successMessage.set('');
    this.resetToken = '';
  }

  onLogin(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.authService.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: () => {
        this.router.navigate(['/perfil']).then(() => {
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al iniciar sesión');
        this.isLoading.set(false);
      }
    });
  }

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
        this.router.navigate(['/perfil']).then(() => {
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al registrar usuario');
        this.isLoading.set(false);
      }
    });
  }

  onForgotPassword(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al procesar la solicitud');
        this.isLoading.set(false);
      }
    });
  }

  onResetPassword(): void {
    this.isLoading.set(true);
    this.error.set('');

    if (this.resetPassword !== this.resetConfirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      this.isLoading.set(false);
      return;
    }

    if (this.resetPassword.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      this.isLoading.set(false);
      return;
    }

    this.authService.resetPassword(this.resetToken, this.resetPassword).subscribe({
      next: () => {
        this.successMessage.set('Contraseña actualizada correctamente');
        setTimeout(() => {
          this.router.navigate(['/login']).then(() => {
          });
        }, 2000);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al restablecer la contraseña');
        this.isLoading.set(false);
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidName(name: string): boolean {
    return name.trim().length >= 2;
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return true;
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  isValidRegister(): boolean {
    return !!(
      this.registerForm.name &&
      this.registerForm.email &&
      this.registerForm.password &&
      this.registerForm.confirmPassword &&
      this.registerForm.password.length >= 6 &&
      this.registerForm.password === this.registerForm.confirmPassword
    );
  }
}

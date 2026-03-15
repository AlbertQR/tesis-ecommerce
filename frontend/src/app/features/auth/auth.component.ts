import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLogin = signal(true);
  isLoading = signal(false);
  error = signal('');
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

  toggleMode(): void {
    this.isLogin.update(v => !v);
    this.error.set('');
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
}

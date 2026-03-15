import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs';

/**
 * Componente de navegación principal (navbar).
 * Proporciona la barra de navegación del sitio con enlaces a las páginas principales,
 * acceso al carrito de compras y opciones de autenticación.
 * 
 * @component NavbarComponent
 * @description Muestra el menú de navegación, el contador del carrito,
 *              y opciones de login/logout según el estado de autenticación.
 * 
 * @example
 * ```html
 * <app-navbar></app-navbar>
 * ```
 * 
 * @requires CartService
 * @requires AuthService
 * @requires Router
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  /** Servicio de carrito para mostrar el número de items */
  private cartService = inject(CartService);
  
  /** Servicio de autenticación para verificar el estado del usuario */
  private authService = inject(AuthService);
  
  /** Router para navegar entre páginas */
  private router = inject(Router);

  /**
   * Signal para controlar el estado del menú móvil (abierto/cerrado).
   * @type {signal<boolean>}
   */
  isMenuOpen = signal(false);
  
  /**
   * Signal para indicar si estamos en una página de administración.
   * @type {signal<boolean>}
   */
  isAdmin = signal(false);

  /**
   * Computed signal con la cantidad de items en el carrito.
   * @readonly
   */
  cartCount = this.cartService.cartCount;
  
  /**
   * Computed signal que indica si el usuario está autenticado.
   * @readonly
   */
  isAuthenticated = this.authService.isAuthenticated;
  
  /**
   * Signal con los datos del usuario actual.
   * @readonly
   */
  user = this.authService.user;

  /**
   * Lifecycle hook que se ejecuta al inicializar el componente.
   * Configura el listener para detectar cambios de ruta.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAdmin.set(event.url.startsWith('/admin'));
      });
  }

  /**
   * Alterna el estado del menú móvil.
   * 
   * @method toggleMenu
   * @returns {void}
   */
  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  /**
   * Cierra la sesión del usuario y navega a la página principal.
   * 
   * @method logout
   * @returns {void}
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

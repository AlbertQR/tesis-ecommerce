import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  isMenuOpen = signal(false);
  isAdmin = signal(false);
  isLegalMenuOpen = signal(false);
  private cartService = inject(CartService);
  cartCount = this.cartService.cartCount;
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  private router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAdmin.set(event.url.startsWith('/admin'));
      });
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  toggleLegalMenu(): void {
    this.isLegalMenuOpen.update((v) => !v);
  }

  closeLegalMenu(): void {
    this.isLegalMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {});
  }
}

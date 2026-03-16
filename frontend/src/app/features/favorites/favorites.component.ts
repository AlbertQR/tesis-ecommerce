import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FavoritesService } from '@core/services/favorites.service';
import { AuthService } from '@core/services/auth.service';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './favorites.component.html'
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  favorites = this.favoritesService.favorites;
  favoriteCount = this.favoritesService.favoriteCount;

  constructor() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }
}

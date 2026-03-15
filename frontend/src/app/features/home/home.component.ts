import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '@core/services/data.service';
import { ProductCardComponent } from '@shares/components/product-card/product-card.component';
import { FormatPricePipe } from '@shares/pipes';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent, FormatPricePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private dataService = inject(DataService);
  categories = this.dataService.categories;
  featuredProducts = this.dataService.products;
  featuredCombo = this.dataService.featuredCombo;
  testimonials = this.dataService.testimonials;

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 !== 0;
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';
import { ProductReviews, Review } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getReviews(productId: string) {
    return this.http.get<ProductReviews>(`${this.apiUrl}/products/${productId}/reviews`);
  }

  getUserReview(productId: string) {
    if (!this.authService.isAuthenticated()) return null;
    return this.http.get<Review | null>(`${this.apiUrl}/products/${productId}/reviews/me`);
  }

  addReview(productId: string, rating: number, comment: string) {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, {
      productId,
      rating,
      comment
    });
  }

  updateReview(reviewId: string, rating: number, comment: string) {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${reviewId}`, {
      rating,
      comment
    });
  }

  deleteReview(reviewId: string) {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }
}

import { Component, Input, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsService, Review, ProductReviews } from '@core/services/reviews.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-product-reviews',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-md p-6 mt-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">Reseñas del Producto</h3>
      
      <!-- Rating Summary -->
      <div class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="text-center">
          <div class="text-4xl font-bold text-brand">{{ reviewsData()?.averageRating || 0 }}</div>
          <div class="flex justify-center gap-1 my-1">
            @for (star of [1,2,3,4,5]; track star) {
              <i [class]="star <= (reviewsData()?.averageRating || 0) ? 'fa-solid fa-star text-yellow-400' : 'fa-regular fa-star text-gray-300'"></i>
            }
          </div>
          <div class="text-sm text-gray-500">{{ reviewsData()?.totalReviews || 0 }} reseñas</div>
        </div>
      </div>

      <!-- Add Review Button -->
      @if (isAuthenticated() && !userReview()) {
        <button (click)="showAddReview.set(true)"
                class="w-full mb-4 py-2 px-4 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
          <i class="fa-solid fa-pen mr-2"></i> Escribir una reseña
        </button>
      }

      <!-- Add/Edit Review Form -->
      @if (showAddReview() || userReview()) {
        <form (ngSubmit)="submitReview()" class="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 class="font-semibold mb-3">{{ userReview() ? 'Editar mi reseña' : 'Nueva reseña' }}</h4>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
            <div class="flex gap-2">
              @for (star of [1,2,3,4,5]; track star) {
                <button type="button" (click)="setRating(star)"
                        class="text-2xl transition-colors"
                        [class.text-yellow-400]="star <= (rating() || userReview()?.rating || 0)"
                        [class.text-gray-300]="star > (rating() || userReview()?.rating || 0)">
                  <i [class]="star <= (rating() || userReview()?.rating || 0) ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                </button>
              }
            </div>
          </div>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
            <textarea [(ngModel)]="comment" name="comment" rows="3"
                      minlength="5" maxlength="500" required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                      placeholder="Comparte tu experiencia con este producto..."></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ comment.length }}/500 caracteres</p>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" [disabled]="isSubmitting() || !rating() || comment.length < 5"
                    class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 transition-colors">
              @if (isSubmitting()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
              } @else {
                {{ userReview() ? 'Actualizar' : 'Enviar' }}
              }
            </button>
            <button type="button" (click)="cancelReview()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      }

      <!-- Reviews List -->
      <div class="space-y-4">
        @for (review of reviewList(); track review.id) {
          <div class="border-b border-gray-100 pb-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="font-semibold text-gray-800">{{ review.userName }}</span>
                <div class="flex gap-1 my-1">
                  @for (star of [1,2,3,4,5]; track star) {
                    <i [class]="star <= review.rating ? 'fa-solid fa-star text-yellow-400 text-sm' : 'fa-regular fa-star text-gray-300 text-sm'"></i>
                  }
                </div>
              </div>
              <span class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</span>
            </div>
            <p class="text-gray-600">{{ review.comment }}</p>
            @if (review.userId === currentUserId()?.id) {
              <div class="mt-2 flex gap-2">
                <button (click)="editReview(review)" class="text-sm text-brand hover:underline">
                  <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button (click)="deleteReview(review.id)" class="text-sm text-red-500 hover:underline">
                  <i class="fa-solid fa-trash"></i> Eliminar
                </button>
              </div>
            }
          </div>
        }
        
        @if (reviewList().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <i class="fa-regular fa-comments text-4xl mb-3"></i>
            <p>Este producto aún no tiene reseñas</p>
            <p class="text-sm">¡Sé el primero en calificarlo!</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: string;
  
  private reviewsService = inject(ReviewsService);
  private authService = inject(AuthService);
  
  reviewsData = signal<ProductReviews | null>(null);
  userReview = signal<Review | null>(null);
  showAddReview = signal(false);
  isSubmitting = signal(false);
  rating = signal<number | null>(null);
  comment = '';

  reviewList = computed(() => this.reviewsData()?.reviews || []);
  
  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }
  
  get currentUserId() {
    return this.authService.user;
  }

  ngOnInit(): void {
    this.loadReviews();
    if (this.authService.isAuthenticated()) {
      this.loadUserReview();
    }
  }

  loadReviews(): void {
    this.reviewsService.getReviews(this.productId).subscribe({
      next: (data) => this.reviewsData.set(data),
      error: () => this.reviewsData.set(null)
    });
  }

  loadUserReview(): void {
    const result = this.reviewsService.getUserReview(this.productId);
    if (result) {
      result.subscribe({
        next: (review) => {
          if (review) {
            this.userReview.set(review);
            this.comment = review.comment;
            this.rating.set(review.rating);
          }
        }
      });
    }
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  submitReview(): void {
    if (!this.rating() || this.comment.length < 5) return;
    
    this.isSubmitting.set(true);
    
    const request = this.userReview()
      ? this.reviewsService.updateReview(this.userReview()!.id, this.rating()!, this.comment)
      : this.reviewsService.addReview(this.productId, this.rating()!, this.comment);

    request.subscribe({
      next: (review) => {
        this.userReview.set(review);
        this.showAddReview.set(false);
        this.isSubmitting.set(false);
        this.loadReviews();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al guardar la reseña');
        this.isSubmitting.set(false);
      }
    });
  }

  editReview(review: Review): void {
    this.rating.set(review.rating);
    this.comment = review.comment;
    this.showAddReview.set(true);
  }

  deleteReview(reviewId: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return;
    
    this.reviewsService.deleteReview(reviewId).subscribe({
      next: () => {
        this.userReview.set(null);
        this.rating.set(null);
        this.comment = '';
        this.showAddReview.set(false);
        this.loadReviews();
      },
      error: () => alert('Error al eliminar la reseña')
    });
  }

  cancelReview(): void {
    this.showAddReview.set(false);
    if (this.userReview()) {
      this.rating.set(this.userReview()!.rating);
      this.comment = this.userReview()!.comment;
    } else {
      this.rating.set(null);
      this.comment = '';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

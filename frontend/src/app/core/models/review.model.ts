export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
}

export interface ProductReviews {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

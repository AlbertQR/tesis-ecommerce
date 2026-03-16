import { Router } from 'express';
import type { Request, Response } from 'express';
import { 
  getProductReviews, 
  addReview, 
  updateReview, 
  deleteReview,
  getUserReviewForProduct
} from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/products/:productId/reviews', (req: Request, res: Response) => {
  getProductReviews(req as any, res);
});

router.get('/products/:productId/reviews/me', authenticate, (req: Request, res: Response) => {
  getUserReviewForProduct(req as any, res);
});

router.post('/reviews', authenticate, (req: Request, res: Response) => {
  addReview(req as any, res);
});

router.put('/reviews/:id', authenticate, (req: Request, res: Response) => {
  updateReview(req as any, res);
});

router.delete('/reviews/:id', authenticate, (req: Request, res: Response) => {
  deleteReview(req as any, res);
});

export default router;

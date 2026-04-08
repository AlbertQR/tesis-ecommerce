import { Response } from 'express';
import mongoose from 'mongoose';
import { Review, User, Order } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

interface ReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId;
    
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    res.json({
      reviews: reviews.map(r => ({
        id: r._id.toString(),
        productId: r.productId,
        userId: r.userId.toString(),
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      })),
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews
    });
  } catch (error) {
    console.error('GetProductReviews error:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { productId, rating, comment } = req.body as ReviewInput;

    if (!productId || !rating || !comment) {
      res.status(400).json({ error: 'Producto, calificación y comentario son requeridos' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
      return;
    }

    if (comment.length < 5 || comment.length > 500) {
      res.status(400).json({ error: 'El comentario debe tener entre 5 y 500 caracteres' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar que el usuario haya comprado el producto
    const hasPurchased = await Order.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      'items.productId': productId,
      status: { $in: ['delivered', 'confirmed', 'preparing', 'ready'] }
    });

    if (!hasPurchased) {
      res.status(403).json({ error: 'Solo puedes reseñar productos que hayas comprado' });
      return;
    }

    const existingReview = await Review.findOne({ productId, userId: new mongoose.Types.ObjectId(userId) });
    if (existingReview) {
      res.status(400).json({ error: 'Ya has dejado una reseña para este producto' });
      return;
    }

    const review = await Review.create({
      productId,
      userId: new mongoose.Types.ObjectId(userId),
      userName: user.name,
      rating,
      comment
    });

    res.status(201).json({
      id: review._id.toString(),
      productId: review.productId,
      userId: review.userId.toString(),
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });
  } catch (error) {
    console.error('AddReview error:', error);
    res.status(500).json({ error: 'Error al agregar reseña' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;
    const { rating, comment } = req.body as Partial<ReviewInput>;

    const review = await Review.findOne({ 
      _id: id, 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!review) {
      res.status(404).json({ error: 'Reseña no encontrada' });
      return;
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
        return;
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (comment.length < 5 || comment.length > 500) {
        res.status(400).json({ error: 'El comentario debe tener entre 5 y 500 caracteres' });
        return;
      }
      review.comment = comment;
    }

    review.updatedAt = new Date();
    await review.save();

    res.json({
      id: review._id.toString(),
      productId: review.productId,
      userId: review.userId.toString(),
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    });
  } catch (error) {
    console.error('UpdateReview error:', error);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { id } = req.params;

    const review = await Review.findOneAndDelete({ 
      _id: id, 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!review) {
      res.status(404).json({ error: 'Reseña no encontrada' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DeleteReview error:', error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

export const getUserReviewForProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const productId = req.params.productId;

    const review = await Review.findOne({ 
      productId, 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!review) {
      res.json(null);
      return;
    }

    res.json({
      id: review._id.toString(),
      productId: review.productId,
      userId: review.userId.toString(),
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });
  } catch (error) {
    console.error('GetUserReviewForProduct error:', error);
    res.status(500).json({ error: 'Error al obtener reseña del usuario' });
  }
};

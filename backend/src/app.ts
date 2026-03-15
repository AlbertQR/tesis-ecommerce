import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { config } from './config/index.js';
import { db } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import contentRoutes from './routes/content.routes.js';
import orderRoutes from './routes/order.routes.js';
import legalRoutes from './routes/legal.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { cleanupExpiredCarts, cleanupExpiredOrders } from './controllers/order.controller.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(session({
  secret: 'dona-yoli-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/invoices', express.static(path.join(process.cwd(), 'invoices')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', contentRoutes);
app.use('/api', orderRoutes);
app.use('/api', legalRoutes);
app.use('/api', uploadRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const startServer = async () => {
  try {
    await db.connect();
    
    setInterval(cleanupExpiredCarts, 60 * 1000);
    setInterval(cleanupExpiredOrders, 60 * 1000);
    
    app.listen(config.port, () => {
      console.log('🌟 Doña Yoli Backend - Ecommerce API');
      console.log(`🚀 Servidor ejecutándose en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

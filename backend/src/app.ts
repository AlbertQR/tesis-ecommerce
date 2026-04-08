import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import paymentRoutes from './routes/payment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import contactRoutes from './routes/contact.routes.js';
import reviewRoutes from './routes/review.routes.js';
import exportRoutes from './routes/export.routes.js';
import { cleanupExpiredCarts, cleanupExpiredOrders } from './controllers/order.controller.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Security headers con helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }
}));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});

// Rate limiting para auth (más restrictivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos, intenta más tarde' }
});

app.use(generalLimiter);

// CORS con whitelist
const allowedOrigins = config.cors.origins;
app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sin origin (mobile apps, Postman) o origins en whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin no permitida por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression({ level: 6, threshold: 1024 }));

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

app.use('/uploads', express.static(
  path.join(process.cwd(), 'public', 'uploads'),
  {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', contentRoutes);
app.use('/api', orderRoutes);
app.use('/api', legalRoutes);
app.use('/api', uploadRoutes);
app.use('/api', paymentRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', contactRoutes);
app.use('/api', reviewRoutes);
app.use('/api', exportRoutes);

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

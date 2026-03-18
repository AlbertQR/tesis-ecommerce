import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const extractToken = (req: AuthRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const queryToken = req.query.token as string;
  if (queryToken) {
    return queryToken;
  }
  return null;
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    return;
  }
  next();
};

export const authorizeStaff = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const allowedRoles = ['admin', 'employee', 'delivery'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de empleado o administrador' });
    return;
  }
  next();
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
      req.user = decoded;
    } catch {
      // Token inválido, pero continuamos sin autenticación
    }
  }
  next();
};

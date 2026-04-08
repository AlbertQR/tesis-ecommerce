// JWT_SECRET es requerido en producción
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export const config = {
  jwt: {
    secret: jwtSecret || 'dona-yoli-secret-key-2024', // Fallback solo para desarrollo
    expiresIn: '7d' as const
  },
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200']
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    },
    from: process.env.EMAIL_FROM || 'Doña Yoli <noreply@example.com>'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200'
};

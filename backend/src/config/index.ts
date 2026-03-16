export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dona-yoli-secret-key-2024',
    expiresIn: '7d' as const
  },
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
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

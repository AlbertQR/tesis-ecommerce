export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dona-yoli-secret-key-2024',
    expiresIn: '7d' as const
  },
  port: parseInt(process.env.PORT || '3000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
  }
};

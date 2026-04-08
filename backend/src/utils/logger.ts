/**
 * Logger básico con soporte para diferentes ambientes.
 * En producción solo muestra errores, en desarrollo muestra todo.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Errores siempre se muestran
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: unknown[]) => {
    if (!isProduction && process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};

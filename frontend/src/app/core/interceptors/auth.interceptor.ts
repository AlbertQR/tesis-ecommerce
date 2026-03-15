import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP que añade el token de autenticación a todas las peticiones salientes.
 * 
 * Este interceptor se ejecuta automáticamente en cada petición HTTP realizada por Angular.
 * Si existe un token de autenticación válido, lo añade al header Authorization.
 * 
 * @interceptor authInterceptor
 * @description Agrega el header `Authorization: Bearer <token>` a las peticiones HTTP
 *              cuando el usuario está autenticado. El token se obtiene del AuthService.
 * 
 * @example
 * ```typescript
 * // Ejemplo de petición que incluirá el token:
 * this.http.get('/api/products').subscribe();
 * 
 * // Petición resultante (si hay token):
 * GET /api/products
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * ```
 * 
 * @requires AuthService
 * @usageNotes
 * Este interceptor debe ser registrado en la configuración de la aplicación (app.config.ts)
 * usando provideHttpClient() con la opción withInterceptors().
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /** Instancia del servicio de autenticación */
  const authService = inject(AuthService);
  
  /** Obtiene el token JWT actual */
  const token = authService.getToken();

  /** Si existe un token, lo añade al header de la petición */
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  /** Si no hay token, prosigue con la petición sin modificar */
  return next(req);
};

# Requisitos No Funcionales - Doña Yoli Ecommerce

## 1. Seguridad

### 1.1 Autenticación
- Implementación de JWT (JSON Web Token) para autenticación
- Token con expiración de 7 días
- Almacenamiento seguro del token en localStorage
- Protección de rutas sensibles mediante middleware de autenticación

### 1.2 Autorización
- Diferenciación de roles: usuario (cliente) y administrador
- Middleware de autorización para rutas administrativas
- Protección de endpoints sensibles (carrito, pedidos, administración)

### 1.3 Validación
- Validación de datos de entrada con Zod
- Sanitización de datos
- Manejo de errores apropiados

---

## 2. Tecnologías

### 2.1 Frontend
- **Framework**: Angular 21
- **Estilos**: Tailwind CSS 4
- **Estado**: Signals de Angular
- **HTTP**: HttpClient con interceptores

### 2.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript (modo estricto)
- **Validación**: Zod
- **Autenticación**: JWT (jsonwebtoken)
- **Gestión de sesiones**: express-session
- **PDF**: PDFKit
- **Base de datos**: MongoDB con Mongoose
- **Testing**: Vitest

---

## 3. Arquitectura

### 3.1 Estructura del Proyecto

#### Frontend (Angular)
```
frontend/src/
├── app/
│   ├── core/
│   │   ├── interceptors/     # Interceptores HTTP
│   │   ├── models/          # Modelos de datos
│   │   └── services/        # Servicios (HTTP, estado)
│   ├── features/
│   │   ├── admin/          # Componentes de administración
│   │   ├── auth/           # Autenticación
│   │   ├── cart/           # Carrito
│   │   ├── home/           # Página principal
│   │   ├── orders/         # Pedidos
│   │   ├── products/        # Productos
│   │   └── profile/       # Perfil de usuario
│   └── shared/
│       └── components/      # Componentes reutilizables
```

#### Backend (Express)
```
backend/src/
├── config/                  # Configuración y base de datos
├── controllers/            # Lógica de negocio
├── middleware/             # Middleware (auth)
├── models/                # Modelos Mongoose
├── routes/                # Definición de rutas
├── schemas/              # Validación Zod
├── types/                 # Tipos TypeScript
├── app.ts                # Configuración de Express
└── index.ts              # Punto de entrada
```

### 3.2 Patrones de Diseño
- **Servicios singleton** para gestión de estado
- **Signals** para reactivity en Angular
- **Middleware** para cross-cutting concerns
- **Controladores** para lógica de negocio
- **Separación de preocupaciones** (rutas, controladores, validación)

---

## 4. Rendimiento

### 4.1 Frontend
- Uso de Angular signals para actualizaciones eficientes
- Lazy loading de rutas
- Componentes standalone
- Cambio detection optimizado

### 4.2 Backend
- Uso de MongoDB con Mongoose
- Conexión configurable mediante variable de entorno
- Sesiones configuradas con cookies httpOnly
- CORS configurado para origen específico

---

## 5. Calidad de Código

### 5.1 TypeScript
- Modo estricto habilitado
- Tipos explícitos requeridos
- No implicit any
- Verificación de tipos en compilación

### 5.2 Angular
- Componentes standalone (sin NgModules)
- Inyección de dependencias con inject()
- Control flow moderno (@if, @for, @switch)

### 5.3 ESLint/Prettier
- Configuración de Prettier para formateo
- Convenciones de código

---

## 6. Experiencia de Usuario (UX)

### 6.1 Interfaz
- Diseño responsivo (mobile-first con Tailwind)
- Feedback visual en interacciones
- Mensajes de error claros
- Iconos de Font Awesome

### 6.2 Navegación
- Barra de navegación fija (sticky)
- Menú responsive con menú móvil
- Rutas lazy-loaded

---

## 7. Mantenibilidad

### 7.1 Organización
- Estructura basada en features
- Barrel exports para imports limpio
- Nombres descriptivos para archivos y funciones

### 7.2 Documentación
- Tipos y interfaces documentados
- Validación con Zod con mensajes claros

---

## 8. Despliegue

### 8.1 Frontend
- Build de producción con Angular CLI
- Output en `dist/angular21-tailwind`

### 8.2 Backend
- Compilación TypeScript
- Ejecución con tsx (desarrollo)
- Puerto configurable (default 3000)

---

## 9. Límites y Restricciones

### 9.1 Base de Datos
- MongoDB con Mongoose ODM
- Conexión: `mongodb://localhost:27017/dona-yoli`
- Datos persistentes entre reinicios
- Seed automático en primera ejecución

### 9.2 Sesiones
- Sesiones basadas en cookies
- Requiere CORS configurado

### 9.3 Archivos
- Facturas almacenadas en carpeta `/invoices`
- Archivos estáticos servidos desde Express

---

## 10. Cumplimiento

### 10.1 Estándares Web
- API RESTful
- JSON para intercambio de datos
- Códigos de estado HTTP apropiados (200, 201, 400, 401, 403, 404, 500)

### 10.2 Validación
- Zod para validación de schemas
- Mensajes de error descriptivos

---

## 11. Confiabilidad

### 11.1 Manejo de Errores
- try-catch en operaciones asíncronas
- Middleware de manejo de errores centralizado
- Respuestas consistentes en caso de errores

### 11.2 Logging
- Console logging para desarrollo
- Errores registrados en backend
- stack trace disponible en desarrollo

---

## 12. Disponibilidad

### 12.1 Modo Offline
- Frontend debe manejar errores de red gracefully
- Mensaje de conexión perdida

### 12.2 Health Check
- Endpoint `/api/health` para verificar estado del servidor

---

## 13. Escalabilidad

### 13.1 Base de Datos
- MongoDB con Mongoose proporciona escalabilidad
- Separación clara entre modelos y lógica de negocio

### 13.2 API
- Endpoints RESTful preparado para expansión
- Versionamiento de API (futuro)

---

## 14. Accesibilidad

### 14.1 Estándares WCAG
- Contraste de colores apropiado
- Textos alternativos en imágenes
- Navegación por teclado

### 14.2 HTML Semántico
- Uso correcto de etiquetas HTML
- ARIA labels donde sea necesario

---

## 15. SEO (Search Engine Optimization)

### 15.1 Meta Tags
- Title y description para cada página
- Open Graph tags para redes sociales

### 15.2 Rendimiento
- Imágenes optimizadas
- Código minimizado en producción

---

## 16. Testing

### 16.1 Unit Tests
- **Backend (Vitest)**: 37+ tests
  - Tests de autenticación (JWT, bcrypt)
  - Tests de productos y categorías
  - Tests de documentos legales
  - Tests de cálculos de carrito
  - Tests de estados de pedidos
- **Frontend (Vitest + Angular)**: 19+ tests
  - Tests de AuthService
  - Tests de UserService
  - Tests de DataService
  - Tests de CartService
  - Tests de LegalService
  - Tests de authInterceptor

### 16.2 Ejecución de Tests
```bash
# Backend
npm test:run     # Tests una vez
npm test         # Modo watch
npm run test:coverage  # Con cobertura

# Frontend
npm test
```

### 16.3 Integración
- Tests de endpoints de API

### 16.4 E2E (Futuro)
- Playwright o Cypress
- Flujos principales automatizados

---

## 17. Variables de Entorno

### 17.1 Configuración
- JWT_SECRET para tokens
- PORT del servidor
- CORS_ORIGIN para desarrollo/producción
- NODE_ENV

---

## 18. Internacionalización (i18n)

### 18.1 Idiomas
- Preparado para español (es-CO)
- Formato de moneda local (COP)
- Fechas en formato local

---

## 19. Recuperación de Contraseña (Futuro)

### 19.1 Flujo
- Solicitud de recuperación por email
- Token temporal
- Nueva contraseña

---

## 20. Opiniones/Reseñas de Productos (Futuro)

### 20.1 Funcionalidad
- Usuarios pueden dejar reseñas
- Calificación por estrellas
- Comentarios

---

## 21. Lista de Deseos (Futuro)

### 21.1 Características
- Guardar productos para después
- Ver lista desde cualquier dispositivo

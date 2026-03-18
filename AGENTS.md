# AGENTS.md - Development Guide

## Project Overview

Full-stack cafe/restaurant website project ("Doña Yoli") with:
- **Frontend**: Angular 21 + Tailwind CSS 4
- **Backend**: Node.js + Express + TypeScript
- **TPV**: Flutter mobile app for employees

## Build, Lint, and Test Commands

### Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start         # or: ng serve
npm start --open  # opens browser automatically

# Build for production
npm run build     # or: ng build

# Watch mode (development builds)
npm run watch     # or: ng build --watch --configuration development

# Run tests
npm test          # or: ng test
```

### Backend (Express + TypeScript)

```bash
cd backend

# Install dependencies
npm install

# Start development server (with ts-node-dev)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage
```

### TPV (Flutter App)

```bash
cd tpv

# Install dependencies
flutter pub get

# Run on emulator/device
flutter run

# Build APK
flutter build apk --release
```

### Running Tests

**Backend tests** (Vitest):
```bash
cd backend
npm test:run
```

**Frontend tests** (Vitest via Angular):
```bash
cd frontend
npm test
```

### Running a Single Test

Angular 21 uses Vitest under the hood. To run a single test file:

```bash
# Run specific test file
ng test --include="**/app.spec.ts"

# Run tests matching a pattern (using Vitest filter)
ng test --filter="should create"
```

For more granular control, you can add a vitest.config.ts to the frontend directory:

```typescript
// vitest.config.ts (create if needed)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
  },
});
```

## Code Style Guidelines

### General Conventions

- **Angular 21**: Use standalone components (no NgModules unless necessary)
- **Structure**: Feature-based organization in `src/app/`
- **Prefix**: Use `app` prefix for components (configured in angular.json)

### Backend (Express)

- **Express.js** with TypeScript
- **JWT authentication** for protected routes
- **Zod** for request validation
- **MongoDB** for cart storage (User model with cart field)
- **PDFKit** for invoice generation
- **QRCode** for delivery verification
- **Multer** for image uploads
- **EnZona** for payment processing

### TypeScript

- **Strict mode enabled**: All strict TypeScript options are on
- **Type annotations**: Always use explicit types for function parameters and return types
- **No implicit any**: Must specify types for all variables
- **noPropertyAccessFromIndexSignature**: Enabled - use `obj['property']` for dynamic keys, `obj.property` for known keys
- **no - allImplicitReturns**: Enabled code paths must return a value
- **noFallthroughCasesInSwitch**: Enabled - always use break or return in switch cases

### Naming Conventions

- **Components**: PascalCase (e.g., `AppComponent`, `ProductList`)
- **Files**: kebab-case (e.g., `product-list.component.ts`)
- **Test files**: `.spec.ts` suffix (e.g., `app.spec.ts`)
- **CSS classes**: kebab-case with Tailwind utilities
- **Variables/camelCase**: `const productList`, `const isActive`

### Imports

- **Order** (configured by Prettier):
  1. External Angular imports
  2. External third-party imports
  3. Internal app imports
- **Use absolute imports**: Configure paths in tsconfig.json
- **Barrel exports**: Use `index.ts` files for clean public APIs

### Templates (HTML)

- **Inline vs External**: Use `templateUrl`/`styleUrl` for components with substantial content
- **Accessibility**: Always include alt attributes, ARIA labels where appropriate
- **Structural directives**: Use `@if`, `@for`, `@switch` (Angular 17+ control flow)

### Styling

- **Tailwind CSS 4**: Use utility classes in templates
- **Custom styles**: Add to `src/styles.css` for global styles
- **Component styles**: Use `app.css` or `styleUrl` for component-specific styles
- **Brand color**: Referenced as `text-brand`, `bg-brand` in templates

### Error Handling

- **Browser errors**: Use `provideBrowserGlobalErrorListeners()` in app.config.ts
- **HTTP errors**: Handle in services with proper error typing
- **Template errors**: Use `@if` blocks to handle null/undefined values

### Testing

- **Framework**: Vitest (via Angular test builder)
- **Test file location**: Same directory as component, `.spec.ts` suffix
- **Test structure**: Use `describe` blocks with `beforeEach` for setup
- **Async tests**: Use `async/await` with `fixture.whenStable()`

### Prettier Configuration

The project uses Prettier with these settings (`.prettierrc`):

- Print width: 100 characters
- Single quotes for JavaScript/TypeScript
- Angular parser for HTML templates

Run Prettier:

```bash
# Frontend
npx prettier --write frontend/src/app/**/*.ts
npx prettier --write frontend/src/app/**/*.html

# Backend
npx prettier --write backend/src/**/*.ts
```

## File Structure

```
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── routes/            # Express routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── order.routes.ts # Cart + checkout
│   │   │   ├── legal.routes.ts # Legal documents
│   │   │   └── upload.routes.ts # Image uploads
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth middleware
│   │   ├── models/           # MongoDB models
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── config/           # Configuration
│   │   └── utils/           # Helpers
│   ├── vitest.config.ts     # Test configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts           # Root component
│   │   │   ├── app.html         # Root template
│   │   │   ├── app.css          # Root styles
│   │   │   ├── app.spec.ts      # Root tests
│   │   │   ├── app.config.ts    # App configuration
│   │   │   ├── app.routes.ts    # Route definitions
│   │   │   ├── core/            # Services, guards, interceptors
│   │   │   │   ├── guards/     # Auth & admin guards
│   │   │   │   ├── interceptors/
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   └── features/        # Page components
│   │   ├── styles.css           # Global styles
│   │   └── main.ts             # Bootstrap entry
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   └── .prettierrc
│
├── tpv/                       # Flutter TPV App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   └── auth_service.dart
│   │   └── screens/
│   │       ├── login_screen.dart
│   │       ├── home_screen.dart
│   │       ├── scanner_screen.dart
│   │       └── orders_screen.dart
│   ├── pubspec.yaml
│   └── test/
│
├── requisitos-funcionales.md
├── requisitos-no-funcionales.md
└── AGENTS.md
```

## Key Dependencies

### Frontend
- Angular 21.2.x
- Tailwind CSS 4.1.x
- Vitest 4.0.x (testing)
- TypeScript 5.9.x
- Prettier 3.8.x
- jwt-decode (JWT decoding)

### Backend
- Express.js
- TypeScript 5.x
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT auth)
- zod (validation)
- express-session (cart session)
- pdfkit (invoice generation)
- qrcode (QR code generation)
- multer (file uploads)
- cors
- dotenv

### TPV (Flutter)
- Flutter 3.7+
- Provider (state management)
- mobile_scanner (QR scanning)
- http (API calls)
- shared_preferences (local storage)

## Database

- **MongoDB**: The backend uses MongoDB as the primary database
- **Connection**: `mongodb://localhost:27017/dona-yoli`
- **Seed data**: Automatically seeded on first run (admin user, products, categories, testimonials, combos, content, legal documents)

## Common Issues

- **Vitest globals**: Already configured in tsconfig.spec.json (`types: ["vitest/globals"]`)
- **Tailwind v4**: Uses CSS-first configuration - no tailwind.config.js needed
- **ES modules**: TypeScript is configured with `"module": "preserve"`
- **Express route ordering**: More specific routes must come before generic routes
- **Cart transformation**: Backend returns `{productId, productName, ...}` but frontend expects `{product: {...}, quantity}`
- **Cart storage**: Cart is now stored in MongoDB (User model), not in session
- **Cart expiration**: Cart expires after 30 minutes, stock is restored automatically
- **Order expiration**: Orders expire after 24 hours if not delivered, stock is restored
- **Token from query**: For file downloads, token can be passed via query string (`?token=xxx`)
- **EnZona payments**: Payment integration requires CONFIGURED EnZona credentials in admin panel
- **Payment settings**: Configure EnZona credentials and refund percentage in `/admin/configuracion`
- **Dashboard stats**: Real statistics from backend at `/api/dashboard/stats`

## Authentication Flow

1. User registers/logs in via `/api/auth/login` or `/api/auth/register`
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. Frontend decodes JWT to get user data (id, email, role)
5. HTTP interceptor adds `Authorization: Bearer <token>` header to requests
6. Protected routes use JWT middleware on backend + frontend guards
7. Cart requires authentication - redirect to login if not authenticated

**Important**: User data is extracted from JWT payload, not stored in localStorage

---

# API Reference Documentation

## Frontend Components

### Core Services

#### AuthService (`frontend/src/app/core/services/auth.service.ts`)
Gestiona la autenticación de usuarios usando signals. Proporciona login, registro, logout y verificación de estado.

**Métodos:**
- `login(email, password)`: Inicia sesión y almacena el token JWT
- `register(name, email, phone, password)`: Registra un nuevo usuario
- `logout()`: Cierra sesión y limpia localStorage
- `getToken()`: Retorna el token JWT actual
- `refreshUser()`: Actualiza los datos del usuario desde el servidor

**Señales (Signals):**
- `user`: Datos del usuario extraídos del JWT (id, email, role)
- `isAuthenticated`: Booleano que indica si hay token válido (computed)
- `isAdmin`: Booleano que indica si el usuario es administrador (computed)

**Nota importante:** Los datos del usuario se obtienen decodificando el JWT, no de localStorage. Esto incluye: id, email, y role.

#### UserService (`frontend/src/app/core/services/user.service.ts`)
Gestiona datos del usuario como direcciones y pedidos.

**Métodos:**
- `loadAddresses()`: Carga las direcciones del usuario
- `loadOrders()`: Carga los pedidos del usuario
- `updateUser(data)`: Actualiza datos del perfil
- `addAddress(address)`: Agrega nueva dirección
- `updateAddress(id, address)`: Actualiza una dirección
- `deleteAddress(id)`: Elimina una dirección
- `setDefaultAddress(id)`: Establece dirección predeterminada
- `getStatusLabel(status)`: Retorna etiqueta en español del estado
- `getStatusClass(status)`: Retorna clases CSS para el badge de estado

**Señales:**
- `user`: Datos del usuario (computed desde AuthService)
- `addresses`: Array de direcciones
- `orders`: Array de pedidos
- `defaultAddress`: Dirección por defecto (computed)
- `pendingOrders`: Pedidos pendientes (computed)
- `completedOrders`: Pedidos completados (computed)

#### CartService (`frontend/src/app/core/services/cart.service.ts`)
Gestiona el carrito de compras con signals. Requiere autenticación.

**Constantes:**
- `DELIVERY_FEE`: Costo de envío fijo (100 COP)

**Métodos:**
- `loadCart()`: Carga el carrito desde el API
- `addToCart(product)`: Agrega producto al carrito
- `removeFromCart(productId)`: Elimina producto del carrito
- `updateQuantity(productId, quantity)`: Actualiza cantidad
- `clearCart()`: Vacía el carrito
- `checkout(addressId, hasDelivery)`: Procesa el pedido
- `toggleDelivery()`: Alterna opción de delivery
- `setDelivery(value)`: Establece opción de delivery
- `canAddToCart()`: Verifica si puede agregar al carrito

**Señales:**
- `cartItems`: Items del carrito (readonly)
- `cartCount`: Cantidad total de items (computed)
- `subtotal`: Subtotal sin envío (computed)
- `deliveryFee`: Costo de envío (computed)
- `cartTotal`: Total con envío (computed)
- `hasDelivery`: Indica si hay delivery activo
- `paymentMethod`: Método de pago ('cash' | 'enzona')

#### DataService (`frontend/src/app/core/services/data.service.ts`)
Proporciona acceso a datos públicos: productos, categorías, testimonios y combos.

**Métodos:**
- `getProductsByCategory(category)`: Filtra productos por categoría
- `getFeaturedProducts()`: Retorna productos destacados
- `getProductById(id)`: Busca producto por ID
- `refreshProducts()`: Actualiza productos desde API
- `refreshCategories()`: Actualiza categorías desde API

**Señales:**
- `products`: Lista de productos (readonly)
- `categories`: Lista de categorías (readonly)
- `testimonials`: Lista de testimonios (readonly)
- `featuredCombo`: Combo destacado (readonly)

#### LegalService (`frontend/src/app/core/services/legal.service.ts`)
Gestiona documentos legales: términos, privacidad y devoluciones.

**Métodos:**
- `loadLegalDocuments()`: Carga todos los documentos legales
- `getLegalDocument(type)`: Obtiene documento por tipo

**Señales:**
- `terms`: Términos y condiciones (readonly)
- `privacy`: Política de privacidad (readonly)
- `returns`: Política de devoluciones (readonly)

#### PaymentService (`frontend/src/app/core/services/payment.service.ts`)
Gestiona los pagos con EnZona.

**Métodos:**
- `createPayment(orderId, amount)`: Crea un pago con EnZona y retorna el link de redirección
- `processRefund(orderId, amount?)`: Procesa un reembolso (admin)

#### DashboardService (`frontend/src/app/core/services/dashboard.service.ts`)
Obtiene estadísticas del dashboard.

**Métodos:**
- `getStats()`: Obtiene estadísticas del dashboard (usuarios, pedidos, productos, ingresos)
- `getSalesData()`: Obtiene datos de ventas para gráfico (últimos 6 meses)
- `getTopProducts()`: Obtiene productos más vendidos
- `getRecentOrders()`: Obtiene pedidos recientes

**Señales:**
- `stats`: Estadísticas del dashboard (readonly)
- `salesData`: Datos de ventas (readonly)
- `topProducts`: Productos populares (readonly)
- `recentOrders`: Pedidos recientes (readonly)

### HTTP Interceptors

#### AuthInterceptor (`frontend/src/app/core/interceptors/auth.interceptor.ts`)
Interceptor HTTP que añade el token JWT al header `Authorization` de todas las peticiones salientes.

**Funcionamiento:**
- Se ejecuta automáticamente en cada petición HTTP
- Obtiene el token del AuthService
- Añade header `Authorization: Bearer <token>` si existe token

**Registro:**
- Configurado en `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor]))`

### Route Guards

#### authGuard (`frontend/src/app/core/guards/auth.guard.ts`)
Protege rutas que requieren autenticación.

**Funcionamiento:**
- Verifica que el token JWT sea válido y no haya expirado
- Redirige a `/login` si no está autenticado

#### adminGuard (`frontend/src/app/core/guards/admin.guard.ts`)
Protege rutas del panel de administración.

**Funcionamiento:**
- Verifica que el usuario tenga rol de admin
- Redirige a `/login` si no autenticado, o a `/` si autenticado pero no admin

### Frontend Components

#### AuthComponent (`frontend/src/app/features/auth/auth.component.ts`)
Componente para login y registro de usuarios.

**Señales:**
- `isLogin`: Modo actual (login/registro)
- `isLoading`: Estado de carga
- `error`: Mensaje de error

**Formularios:**
- `loginForm`: Datos para login (email, password)
- `registerForm`: Datos para registro (name, email, phone, password, confirmPassword)

**Métodos:**
- `toggleMode()`: Cambia entre modo login y registro
- `onLogin()`: Procesa el login
- `onRegister()`: Procesa el registro

#### CartComponent (`frontend/src/app/features/cart/cart.component.ts`)
Componente para visualizar y gestionar el carrito de compras.

**Propiedades:**
- `cartItems`: Items del carrito (del CartService)
- `cartTotal`: Total del carrito (del CartService)
- `cartCount`: Cantidad de items (del CartService)
- `subtotal`: Subtotal (del CartService)
- `deliveryFee`: Costo de envío (del CartService)
- `hasDelivery`: Indica si hay delivery (del CartService)

**Métodos:**
- `updateQuantity(productId, quantity)`: Actualiza cantidad
- `removeFromCart(productId)`: Elimina producto
- `clearCart()`: Vacía el carrito
- `formatPrice(price)`: Formatea precio a COP
- `onChangeDelivery()`: Cambia opción de delivery

#### ProductsComponent (`frontend/src/app/features/products/products.component.ts`)
Componente para mostrar y filtrar el catálogo de productos.

**Interfaces:**
- `ProductFilters`: Filtros de búsqueda (search, category, priceRange, sortBy, onlyHot, onlyFeatured)

**Señales:**
- `filters`: Filtros actuales
- `priceMin`, `priceMax`: Rango de precios

**Propiedades:**
- `categories`: Categorías disponibles para filtrar
- `sortOptions`: Opciones de ordenamiento
- `filteredProducts`: Productos filtrados (computed)
- `productCount`: Cantidad de productos filtrados (computed)

**Métodos:**
- `updateSearch(value)`: Actualiza búsqueda
- `updateCategory(category)`: Actualiza categoría
- `updateSort(sortBy)`: Actualiza ordenamiento
- `toggleHot()`: Alterna filtro de productos hot
- `toggleFeatured()`: Alterna filtro de productos destacados
- `updatePriceRange()`: Actualiza rango de precios
- `resetFilters()`: Reinicia todos los filtros
- `formatPrice(price)`: Formatea precio a COP
- `hasActiveFilters()`: Verifica si hay filtros activos

#### HomeComponent (`frontend/src/app/features/home/home.component.ts`)
Componente de la página principal.

**Propiedades:**
- `categories`: Categorías (del DataService)
- `featuredProducts`: Productos destacados (del DataService)
- `featuredCombo`: Combo destacado (del DataService)
- `testimonials`: Testimonios (del DataService)

**Métodos:**
- `formatPrice(price)`: Formatea precio a COP
- `getStars(rating)`: Genera array de estrellas
- `hasHalfStar(rating)`: Verifica si hay media estrella

#### ProfileComponent (`frontend/src/app/features/profile/profile.component.ts`)
Componente para gestionar el perfil del usuario.

**Señales:**
- `isEditingProfile`: Modo edición de perfil
- `isAddingAddress`: Modo agregar dirección
- `editingAddressId`: ID de dirección en edición

**Formularios:**
- `profileForm`: Datos del perfil (name, email, phone)
- `addressForm`: Datos de dirección (label, street, number, city, neighborhood, instructions, isDefault)

**Propiedades:**
- `user`: Datos del usuario (del UserService)
- `addresses`: Direcciones (del UserService)

**Métodos:**
- `startEditProfile()`: Inicia edición de perfil
- `saveProfile()`: Guarda cambios del perfil
- `cancelEditProfile()`: Cancela edición
- `startAddAddress()`: Inicia agregar dirección
- `startEditAddress(address)`: Inicia editar dirección
- `saveAddress()`: Guarda dirección
- `cancelAddress()`: Cancela operación de dirección
- `deleteAddress(id)`: Elimina dirección
- `setDefaultAddress(id)`: Establece dirección por defecto

#### OrdersComponent (`frontend/src/app/features/orders/orders.component.ts`)
Componente para listar pedidos del usuario.

**Señales:**
- `activeTab`: Pestaña activa (all/pending/completed)
- `selectedOrder`: Pedido seleccionado para ver detalles

**Propiedades:**
- `orders`: Todos los pedidos (del UserService)
- `pendingOrders`: Pedidos pendientes (del UserService)
- `completedOrders`: Pedidos completados (del UserService)
- `filteredOrders`: Pedidos según pestaña activa (getter)

**Métodos:**
- `setTab(tab)`: Cambia pestaña activa
- `getStatusLabel(status)`: Obtiene etiqueta del estado
- `getStatusClass(status)`: Obtiene clase CSS del estado
- `formatPrice(price)`: Formatea precio a COP
- `formatDate(date)`: Formatea fecha
- `viewOrderDetails(order)`: Muestra detalles del pedido
- `closeOrderDetails()`: Cierra modal de detalles
- `getItemCount(items)`: Cuenta total de items

#### ContactComponent (`frontend/src/app/features/contact/contact.component.ts`)
Componente para formulario de contacto.

**Señales:**
- `isSubmitting`: Estado de envío
- `submitted`: Indica si se envió correctamente

**Formularios:**
- `formData`: Datos del formulario (name, email, phone, subject, message)

**Propiedades:**
- `subjects`: Opciones de asunto

**Métodos:**
- `onSubmit()`: Envía el formulario

#### AboutComponent (`frontend/src/app/features/about/about.component.ts`)
Componente para la página "Nosotros".

**Propiedades:**
- `stats`: Estadísticas de la empresa (value, label)

#### AdminLayoutComponent (`frontend/src/app/features/admin/admin-layout.component.ts`)
Componente contenedor del panel de administración. Utiliza Angular Router para mostrar las páginas hijos.

#### AdminDashboardComponent (`frontend/src/app/features/admin/dashboard/admin-dashboard.component.ts`)
Componente del dashboard administrativo.

**Interfaces:**
- `Stats`: Estadísticas (title, value, change, changeType, icon)
- `SalesData`: Datos de ventas (labels, values)

**Propiedades:**
- `stats`: Array de estadísticas
- `salesData`: Datos para gráfico de ventas
- `recentOrders`: Pedidos recientes
- `topProducts`: Productos más vendidos

**Métodos:**
- `formatPrice(price)`: Formatea precio a COP
- `getMaxSales()`: Obtiene el valor máximo de ventas

#### AdminUsersComponent (`frontend/src/app/features/admin/users/admin-users.component.ts`)
Componente para gestionar usuarios (solo administradores).

**Interfaces:**
- `User`: Estructura de usuario (id, name, email, phone, role, createdAt)

**Señales:**
- `users`: Lista de usuarios
- `searchTerm`: Término de búsqueda
- `roleFilter`: Filtro por rol
- `isLoading`: Estado de carga

**Métodos:**
- `loadUsers()`: Carga usuarios desde API
- `filteredUsers()`: Filtra usuarios según búsqueda y rol
- `getRoleLabel(role)`: Obtiene etiqueta del rol
- `getRoleClass(role)`: Obtiene clase CSS del rol
- `formatDate(date)`: Formatea fecha
- `toggleRole(user)`: Cambia rol del usuario
- `deleteUser(userId)`: Elimina usuario

#### AdminProductsComponent (`frontend/src/app/features/admin/products-management/admin-products.component.ts`)
Componente para gestionar productos (solo administradores).

**Interfaces:**
- `Product`: Estructura de producto

**Señales:**
- `products`: Lista de productos
- `categoryFilter`: Filtro por categoría
- `searchTerm`: Término de búsqueda
- `isEditing`: Modo edición
- `editingProduct`: Producto en edición
- `isLoading`: Estado de carga

**Propiedades:**
- `formData`: Datos del formulario de producto
- `categories`: Categorías disponibles

**Métodos:**
- `loadProducts()`: Carga productos
- `filteredProducts()`: Filtra productos
- `formatPrice(price)`: Formatea precio
- `getCategoryLabel(category)`: Obtiene nombre de categoría
- `getCategoryClass(category)`: Obtiene clase CSS
- `getStockClass(stock)`: Obtiene clase según stock
- `startAdd()`: Inicia agregar producto
- `startEdit(product)`: Inicia editar producto
- `save()`: Guarda producto
- `deleteProduct(id)`: Elimina producto
- `toggleFeatured(id)`: Alterna producto destacado
- `toggleHot(id)`: Alterna producto hot
- `updateStock(id, change)`: Actualiza stock

#### AdminOrdersComponent (`frontend/src/app/features/admin/orders-management/admin-orders.component.ts`)
Componente para gestionar pedidos (solo administradores).

**Interfaces:**
- `Order`: Estructura completa del pedido

**Señales:**
- `orders`: Lista de pedidos
- `statusFilter`: Filtro por estado
- `searchTerm`: Término de búsqueda
- `selectedOrder`: Pedido seleccionado
- `isLoading`: Estado de carga

**Propiedades:**
- `statusOptions`: Opciones de estado

**Métodos:**
- `loadOrders()`: Carga pedidos
- `filteredOrders()`: Filtra pedidos
- `formatPrice(price)`: Formatea precio
- `formatDate(date)`: Formatea fecha
- `getStatusLabel(status)`: Obtiene etiqueta
- `getStatusClass(status)`: Obtiene clase CSS
- `updateStatus(orderId, newStatus)`: Actualiza estado
- `viewOrder(order)`: Muestra detalles
- `closeModal()`: Cierra modal
- `getItemCount(items)`: Cuenta items

#### AdminContentComponent (`frontend/src/app/features/admin/content/admin-content.component.ts`)
Componente para gestionar contenido y testimonios (solo administradores).

**Interfaces:**
- `Content`: Contenido (key, value, type)
- `Testimonial`: Testimonio

**Señales:**
- `contents`: Lista de contenidos
- `testimonials`: Lista de testimonios
- `activeTab`: Pestaña activa
- `isLoading`: Estado de carga
- `isEditingContent`: Modo edición contenido
- `editingContent`: Contenido en edición
- `isEditingTestimonial`: Modo edición testimonio
- `editingTestimonial`: Testimonio en edición

**Formularios:**
- `contentForm`: Datos de contenido
- `testimonialForm`: Datos de testimonio

**Métodos:**
- `loadContents()`: Carga contenidos
- `loadTestimonials()`: Carga testimonios
- `startEditContent(content)`: Inicia editar contenido
- `saveContent()`: Guarda contenido
- `startAddContent()`: Inicia agregar contenido
- `saveNewContent()`: Guarda nuevo contenido
- `deleteContent(key)`: Elimina contenido
- `startEditTestimonial(testimonial)`: Inicia editar testimonio
- `saveTestimonial()`: Guarda testimonio
- `startAddTestimonial()`: Inicia agregar testimonio
- `saveNewTestimonial()`: Guarda nuevo testimonio
- `deleteTestimonial(id)`: Elimina testimonio
- `formatDate(date)`: Formatea fecha

#### AdminLegalComponent (`frontend/src/app/features/admin/legal-management/admin-legal.component.ts`)
Componente para gestionar documentos legales (solo administradores).

**Interfaces:**
- `LegalDocument`: Documento legal

**Señales:**
- `documents`: Lista de documentos
- `isLoading`: Estado de carga
- `isEditing`: Modo edición
- `editingDoc`: Documento en edición

**Propiedades:**
- `formData`: Datos del formulario
- `typeLabels`: Etiquetas de tipos de documento

**Métodos:**
- `loadDocuments()`: Carga documentos
- `startEdit(doc)`: Inicia editar documento
- `saveDocument()`: Guarda documento
- `cancelEdit()`: Cancela edición
- `toggleActive(doc)`: Alterna estado activo
- `formatDate(date)`: Formatea fecha

#### Legal Components (Terms, Privacy, Returns)
Componentes simples que muestran documentos legales.

- **TermsComponent** (`frontend/src/app/features/legal/terms/terms.component.ts`): Muestra términos y condiciones
- **PrivacyComponent** (`frontend/src/app/features/legal/privacy/privacy.component.ts`): Muestra política de privacidad
- **ReturnsComponent** (`frontend/src/app/features/legal/returns/returns.component.ts`): Muestra política de devoluciones

Todos tienen una propiedad `document` que obtienen del LegalService.

#### ProductCardComponent (`frontend/src/app/shared/components/product-card/product-card.component.ts`)
Componente de tarjeta para mostrar un producto.

**Input:**
- `product`: Producto a mostrar (required)

**Métodos:**
- `addToCart()`: Agrega producto al carrito
- `getCategoryLabel()`: Obtiene etiqueta de categoría
- `getCategoryBadgeClass()`: Obtiene clase CSS del badge
- `formatPrice(price)`: Formatea precio a COP

### Frontend Routes (`frontend/src/app/app.routes.ts`)

**Rutas públicas:**
- `/` - Página principal (HomeComponent)
- `/nosotros` - Página nosotros (AboutComponent)
- `/productos` - Catálogo de productos (ProductsComponent)
- `/carrito` - Carrito de compras (CartComponent)
- `/contacto` - Formulario de contacto (ContactComponent)
- `/terminos` - Términos y condiciones (TermsComponent)
- `/privacidad` - Política de privacidad (PrivacyComponent)
- `/devoluciones` - Política de devoluciones (ReturnsComponent)
- `/login` - Login (AuthComponent)
- `/registro` - Registro (AuthComponent)

**Rutas protegidas (authGuard):**
- `/perfil` - Perfil de usuario (ProfileComponent)
- `/pedidos` - Lista de pedidos (OrdersComponent)
- `/pedido/:id` - Confirmación de pedido (OrderConfirmationComponent)

**Rutas de administración (adminGuard):**
- `/admin` - Dashboard
- `/admin/usuarios` - Gestión de usuarios
- `/admin/pedidos` - Gestión de pedidos
- `/admin/productos` - Gestión de productos
- `/admin/contenido` - Gestión de contenido
- `/admin/legal` - Gestión de documentos legales
- `/admin/configuracion` - Configuración de pagos (EnZona)

---

## Backend API

### Controllers

#### UploadController (`backend/src/controllers/upload.controller.ts`)
Gestiona la subida de imágenes al servidor.

**Funciones:**
- `uploadImage(req, res)`: Sube una imagen al servidor (admin)

**Detalles:**
- Endpoint: `POST /api/upload`
- Requiere autenticación y rol admin
- Almacena en: `public/uploads/`
- Formatos: jpeg, jpg, png, gif, webp
- Tamaño máximo: 5MB
- Retorna URL de la imagen subida

#### AuthController (`backend/src/controllers/auth.controller.ts`)

**Funciones:**
- `register(req, res)`: Registra nuevo usuario. Valida email único, hashea contraseña, genera JWT
- `login(req, res)`: Autentica usuario. Valida credenciales, retorna JWT
- `getMe(req, res)`: Obtiene datos del usuario actual (requiere autenticación)

#### UserController (`backend/src/controllers/user.controller.ts`)

**Funciones:**
- `getProfile(req, res)`: Obtiene perfil con direcciones
- `updateProfile(req, res)`: Actualiza datos del perfil
- `getAddresses(req, res)`: Lista direcciones del usuario
- `createAddress(req, res)`: Crea nueva dirección
- `updateAddress(req, res)`: Actualiza dirección existente
- `deleteAddress(req, res)`: Elimina dirección
- `setDefaultAddress(req, res)`: Establece dirección predeterminada
- `getAllUsers(req, res)`: Lista todos los usuarios (admin)
- `updateUser(req, res)`: Actualiza usuario (admin)
- `deleteUser(req, res)`: Elimina usuario (admin)

#### ProductController (`backend/src/controllers/product.controller.ts`)

**Funciones:**
- `getProducts(req, res)`: Lista productos con filtros opcionales (category, featured, hot, combo)
- `getProductById(req, res)`: Obtiene producto por ID
- `createProduct(req, res)`: Crea nuevo producto (admin)
- `updateProduct(req, res)`: Actualiza producto (admin)
- `deleteProduct(req, res)`: Elimina producto (admin)
- `getCategories(req, res)`: Lista categorías
- `createCategory(req, res)`: Crea categoría (admin)
- `updateCategory(req, res)`: Actualiza categoría (admin)
- `deleteCategory(req, res)`: Elimina categoría (admin)

#### OrderController (`backend/src/controllers/order.controller.ts`)

**Funciones del carrito:**
- `getCart(req, res)`: Obtiene carrito actual
- `addToCart(req, res)`: Agrega producto al carrito (valida stock)
- `updateCartItem(req, res)`: Actualiza cantidad
- `removeFromCart(req, res)`: Elimina producto
- `clearCart(req, res)`: Vacía carrito

**Funciones de pedidos:**
- `checkout(req, res)`: Procesa el pedido, genera factura PDF con QR, crea orden, descuenta stock
- `getOrders(req, res)`: Lista pedidos del usuario
- `getOrderById(req, res)`: Obtiene pedido por ID
- `getAllOrders(req, res)`: Lista todos los pedidos (admin)
- `updateOrderStatus(req, res)`: Actualiza estado del pedido (admin)
- `downloadInvoice(req, res)`: Descarga factura PDF
- `verifyOrderByQR(req, res)`: Verifica pedido mediante QR y marca como entregado

**Funciones internas:**
- `generateInvoice(...)`: Genera PDF de factura usando PDFKit con código QR
- `cleanupExpiredCarts()`: Limpia carritos expirados (30 min), restaura stock
- `cleanupExpiredOrders()`: Limpia pedidos expirados (24 horas), cancela y restaura stock

**Funciones del backend (app.ts):**
- Cleanup se ejecuta cada 60 segundos automáticamente

#### ContentController (`backend/src/controllers/content.controller.ts`)

**Testimonios:**
- `getTestimonials(req, res)`: Lista testimonios
- `createTestimonial(req, res)`: Crea testimonio (admin)
- `updateTestimonial(req, res)`: Actualiza testimonio (admin)
- `deleteTestimonial(req, res)`: Elimina testimonio (admin)

**Combos:**
- `getCombos(req, res)`: Lista combos (soporta filtro featured)
- `getComboById(req, res)`: Obtiene combo por ID
- `createCombo(req, res)`: Crea combo (admin)
- `updateCombo(req, res)`: Actualiza combo (admin)
- `deleteCombo(req, res)`: Elimina combo (admin)

**Contenido:**
- `getContents(req, res)`: Lista contenidos o uno específico
- `getContentByKey(req, res)`: Obtiene contenido por clave
- `createContent(req, res)`: Crea contenido (admin)
- `updateContent(req, res)`: Actualiza contenido (admin)
- `deleteContent(req, res)`: Elimina contenido (admin)

#### LegalController (`backend/src/controllers/legal.controller.ts`)

**Funciones:**
- `getLegalDocuments(req, res)`: Lista documentos legales activos
- `getLegalDocumentByType(req, res)`: Obtiene documento por tipo
- `getAllLegalDocuments(req, res)`: Lista todos los documentos (admin)
- `createLegalDocument(req, res)`: Crea documento (admin)
- `updateLegalDocument(req, res)`: Actualiza documento (admin)
- `deleteLegalDocument(req, res)`: Elimina documento (admin)

### Middleware (`backend/src/middleware/auth.ts`)

**Interfaz:**
- `AuthRequest`: Extiende Request con propiedad `user` opcional

**Funciones:**
- `authenticate(req, res, next)`: Verifica JWT en header Authorization. Retorna 401 si no hay token o es inválido
- `authorizeAdmin(req, res, next)`: Verifica que el usuario tenga rol admin. Retorna 403 si no
- `optionalAuth(req, res, next)`: Similar a authenticate pero no falla si no hay token. Útil para rutas públicas con datos opcionales

### Routes

#### auth.routes.ts
- `POST /register` - Registro de usuario
- `POST /login` - Login de usuario
- `GET /me` - Datos del usuario actual (protegido)

#### user.routes.ts
- `GET /profile` - Perfil del usuario (protegido)
- `PUT /profile` - Actualizar perfil (protegido)
- `GET /addresses` - Lista direcciones (protegido)
- `POST /addresses` - Crear dirección (protegido)
- `PUT /addresses/:id` - Actualizar dirección (protegido)
- `DELETE /addresses/:id` - Eliminar dirección (protegido)
- `PUT /addresses/:id/default` - Establecer predeterminada (protegido)
- `GET /admin/users` - Lista usuarios (admin)
- `PUT /admin/users/:id` - Actualizar usuario (admin)
- `DELETE /admin/users/:id` - Eliminar usuario (admin)

#### product.routes.ts
- `GET /products` - Lista productos (público)
- `GET /products/:id` - Producto por ID (público)
- `POST /products` - Crear producto (admin)
- `PUT /products/:id` - Actualizar producto (admin)
- `DELETE /products/:id` - Eliminar producto (admin)
- `GET /categories` - Lista categorías (público)
- `POST /categories` - Crear categoría (admin)
- `PUT /categories/:id` - Actualizar categoría (admin)
- `DELETE /categories/:id` - Eliminar categoría (admin)

#### order.routes.ts (Carrito y Pedidos)

*Carrito (protegido):*
- `GET /cart` - Obtener carrito
- `POST /cart` - Agregar producto
- `PUT /cart/:productId` - Actualizar cantidad
- `DELETE /cart/:productId` - Eliminar producto
- `DELETE /cart` - Vaciar carrito

*Checkout (protegido):*
- `POST /checkout` - Procesar pedido

*Pedidos (protegido):*
- `GET /orders` - Lista pedidos del usuario
- `GET /orders/:id` - Detalles del pedido
- `GET /orders/:id/invoice` - Descargar factura

*Admin:*
- `GET /admin/orders` - Lista todos los pedidos
- `PUT /admin/orders/:id/status` - Actualizar estado

#### content.routes.ts
- `GET /testimonials` - Lista testimonios (público)
- `POST /testimonials` - Crear testimonio (admin)
- `PUT /testimonials/:id` - Actualizar testimonio (admin)
- `DELETE /testimonials/:id` - Eliminar testimonio (admin)
- `GET /combos` - Lista combos (público, soporta ?featured=true)
- `GET /combos/:id` - Combo por ID (público)
- `POST /combos` - Crear combo (admin)
- `PUT /combos/:id` - Actualizar combo (admin)
- `DELETE /combos/:id` - Eliminar combo (admin)
- `GET /contents` - Lista contenidos (público)
- `GET /contents/:key` - Contenido por clave (público)
- `POST /contents` - Crear contenido (admin)
- `PUT /contents/:key` - Actualizar contenido (admin)
- `DELETE /contents/:key` - Eliminar contenido (admin)

#### legal.routes.ts
- `GET /legal/terms` - Términos y condiciones (público)
- `GET /legal/privacy` - Política de privacidad (público)
- `GET /legal/returns` - Política de devoluciones (público)
- `GET /admin/legal` - Lista todos los documentos (admin)
- `PUT /admin/legal/:type` - Actualizar documento (admin)

#### upload.routes.ts
- `POST /upload` - Subir imagen (admin)

#### payment.routes.ts
- `POST /payments` - Crear pago con EnZona (protegido)
- `GET /payments/callback` - Callback de EnZona después del pago
- `GET /payments/cancel` - Cancelación de pago
- `POST /payments/refund` - Procesar reembolso (admin)
- `GET /payments/settings` - Obtener configuración de pagos (admin)
- `PUT /payments/settings` - Actualizar configuración de pagos (admin)

#### dashboard.routes.ts
- `GET /dashboard/stats` - Obtener estadísticas del dashboard (admin)

#### order.routes.ts (endpoints adicionales)
- `POST /verify-qr` - Verificar pedido mediante QR (público)

### Schemas de Validación (`backend/src/schemas/validation.ts`)

**Zod Schemas:**

| Schema | Descripción |
|--------|-------------|
| `registerSchema` | Validación para registro (email, password min 6, name min 2, phone min 10) |
| `loginSchema` | Validación para login (email, password requeridos) |
| `updateUserSchema` | Validación parcial para actualizar usuario |
| `addressSchema` | Validación de dirección (label, street, number, city, neighborhood requeridos) |
| `updateAddressSchema` | Validación parcial para dirección |
| `productSchema` | Validación de producto (name, description, price positivo, category válida, image URL, stock no negativo) |
| `updateProductSchema` | Validación parcial para producto |
| `testimonialSchema` | Validación de testimonio |
| `comboSchema` | Validación de combo |
| `contentSchema` | Validación de contenido (key, value, type) |
| `cartItemSchema` | Validación de item de carrito |
| `checkoutSchema` | Validación de checkout (addressId, hasDelivery) |
| `updateOrderStatusSchema` | Validación de estado de pedido |

**Types derivados:**
- `RegisterInput`, `LoginInput`, `UpdateUserInput`, `AddressInput`, `UpdateAddressInput`
- `ProductInput`, `UpdateProductInput`, `TestimonialInput`, `ComboInput`, `ContentInput`
- `CartItemInput`, `CheckoutInput`, `UpdateOrderStatusInput`

### Modelos de Base de Datos

#### UserModel (`backend/src/models/user.model.ts`)
- `email`: String único
- `password`: String (hasheada)
- `name`: String
- `phone`: String
- `avatar`: String (opcional)
- `role`: Enum ('user' | 'admin')
- `cart`: Array de items del carrito
- `cartExpiresAt`: Fecha de expiración del carrito
- `createdAt`, `updatedAt`: Dates

#### ProductModel (`backend/src/models/product.model.ts`)
- `name`, `description`: Strings
- `price`: Number (COP)
- `category`: Enum ('cafeteria' | 'pizzeria' | 'despensa' | 'combo')
- `image`: String (URL)
- `isFeatured`, `isHot`, `isCombo`: Booleans
- `stock`: Number
- `createdAt`, `updatedAt`: Dates

#### Otros modelos (Address, Order, Category, Testimonial, Combo, Content, Legal, Settings)
Consulte los archivos individuales en `backend/src/models/` para ver sus campos específicos.

**Order incluye:**
- `paymentStatus`: 'pending' | 'paid' | 'refunded'
- `transactionUuid`: UUID de la transacción EnZona
- `refundAmount`, `refundPercentage`, `refundTransactionUuid`: Campos de reembolso

#### SettingsModel (`backend/src/models/settings.model.ts`)
- `key`: String único (ej: 'enzona_consumer_key', 'refund_percentage')
- `value`: String
- Configuración de EnZona: consumer_key, consumer_secret, merchant_uuid
- Configuración de reembolsos: refund_percentage, refund_enabled

---

## Autenticación y Guards

### JWT Authentication
- El token JWT se almacena en localStorage
- Los datos del usuario (id, email, role) se extraen del payload del JWT
- No se almacenan datos sensibles del usuario en localStorage
- El token incluye expiración que se valida automáticamente

### Guards (Rutas Protegidas)

#### authGuard (`frontend/src/app/core/guards/auth.guard.ts`)
- Protege rutas que requieren autenticación
- Verifica que exista un token JWT válido
- Redirige a `/login` si no está autenticado

#### adminGuard (`frontend/src/app/core/guards/admin.guard.ts`)
- Protege rutas del panel de administración
- Verifica que el usuario tenga rol `admin`
- Redirige a `/login` si no autenticado, o a `/` si autenticado pero no admin

### Rutas Protegidas
- **authGuard**: `/perfil`, `/pedidos`, `/pedido/:id`
- **adminGuard**: `/admin` y todas sus sub-rutas

---

## Glosario de Términos

| Término | Descripción |
|---------|-------------|
| Signal | Función reactiva de Angular para estado |
| Computed | Signal derivado que recalcula automáticamente |
| JWT | JSON Web Token para autenticación |
| Middleware | Función que se ejecuta entre petición y respuesta |
| Controller | Manejador de rutas en Express |
| Pipe | Operador de RxJS para transformar datos |
| Standalone component | Componente Angular sin NgModule |
| Lazy loading | Carga bajo demanda de módulos/rutas |

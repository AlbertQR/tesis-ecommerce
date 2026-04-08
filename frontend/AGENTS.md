# Frontend Agents - Doña Yoli

## Stack Tecnológico

- **Framework**: Angular 21 (standalone components, signals)
- **Styling**: Tailwind CSS 4 (configurado en CSS con `@theme`, sin tailwind.config.js)
- **State**: Signals puro (sin NgRx ni otros state managers)
- **Routing**: Angular Router con lazy loading y View Transitions
- **HTTP**: HttpClient con interceptors funcionales
- **Auth**: JWT decodificado con `jwt-decode`
- **Icons**: Font Awesome via CDN público
- **Testing**: Vitest

## Arquitectura General

```
src/app/
├── app.config.ts              # Config global (providers, HTTP, animations)
├── app.routes.ts              # Rutas con lazy loading
├── app.ts                     # Root component
├── core/
│   ├── models/               # Interfaces y tipos TypeScript
│   ├── services/             # Servicios singleton (signals)
│   ├── guards/               # Guards funcionales (CanActivateFn)
│   └── interceptors/         # HTTP interceptors funcionales
├── features/
│   ├── admin/                # Panel admin (child routes)
│   ├── auth/                 # Login, registro, reset password
│   ├── cart/                 # Carrito y checkout
│   ├── home/                 # Landing page
│   ├── legal/                # Términos, privacidad, devoluciones
│   ├── orders/               # Mis pedidos
│   ├── products/             # Catálogo y detalle de producto
│   ├── profile/              # Perfil y direcciones
│   ├── favorites/             # Favoritos
│   ├── contact/              # Formulario de contacto
│   └── not-found/             # 404
└── shared/
    ├── components/           # Navbar, Footer, ProductCard, etc.
    └── pipes/                # FormatPrice, FormatDate
```

## app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),  // View Transitions API
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ]
};
```

**Nota**: Usa `withFetch()` en lugar de XHR por defecto.

## Rutas Principales

### Rutas Públicas
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | HomeComponent | Landing page |
| `/nosotros` | AboutComponent | About page |
| `/productos` | ProductsComponent | Catálogo con filtros |
| `/producto/:id` | ProductDetailComponent | Detalle de producto |
| `/carrito` | CartComponent | Carrito de compras |
| `/login`, `/registro` | AuthComponent | Auth (login/register/forgot) |
| `/contacto` | ContactComponent | Formulario contacto |
| `/terminos`, `/privacidad`, `/devoluciones` | Legal components | Docs legales |
| `/404` | NotFoundComponent | Página 404 |

### Rutas Protegidas (authGuard)
| Ruta | Descripción |
|------|-------------|
| `/perfil` | Perfil de usuario |
| `/favoritos` | Lista de favoritos |
| `/pedidos` | Mis pedidos |
| `/pedido/:id` | Detalle de pedido |

### Rutas Admin (adminGuard)
| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard principal |
| `/admin/usuarios` | Gestión de usuarios |
| `/admin/pedidos` | Gestión de pedidos |
| `/admin/productos` | Gestión de productos |
| `/admin/categorias` | Gestión de categorías |
| `/admin/contenido` | Testimonios y combos |
| `/admin/legal` | Documentos legales |
| `/admin/configuracion` | Settings del sistema |

## Patrón de Servicios (Signals)

**TODOS los servicios usan signals para estado reactivo:**

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  // Signals privados
  private _products = signal<ProductModel[]>([]);
  private _categories = signal<Category[]>([]);
  private _loading = signal(false);

  // Readonly para exposición
  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();

  // Computed
  readonly activeCategories = computed(() => 
    this._categories().filter(c => c.active)
  );
}
```

## Servicios Disponibles

### AuthService
```typescript
// Signals
readonly user = this.userSignal.asReadonly();
readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');
readonly isAuthenticated = computed(() => !!this.tokenSignal() && this.isTokenValid());

// Métodos
login(email: string, password: string): Observable<AuthResponse>
register(name: string, email: string, phone: string, password: string): Observable<AuthResponse>
logout(): void
refreshUser(): Observable<UserModel>
forgotPassword(email: string): Observable<{ message: string }>
resetPassword(token: string, password: string): Observable<{ message: string }>
getToken(): string | null
```

### CartService
```typescript
// Signals
readonly hasDelivery = signal(false);
readonly paymentMethod = signal<PaymentMethod>('cash');
readonly cartItems = this.items.asReadonly();
readonly cartCount = computed(() => ...)
readonly subtotal = computed(() => ...)
readonly deliveryFee = computed(() => ...)  // 100 COP si delivery
readonly cartTotal = computed(() => ...)

// Métodos
addToCart(product: ProductModel): boolean
removeFromCart(productId: string): void
updateQuantity(productId: string, quantity: number): void
clearCart(): void
setPaymentMethod(method: PaymentMethod): void
toggleDelivery(): void
checkout(addressId: string, hasDelivery: boolean): Observable<any>
```

### UserService
```typescript
// Signals
readonly user = computed(() => this.userProfileSignal());
readonly addresses = this.addressesSignal.asReadonly();
readonly orders = this.ordersSignal.asReadonly();
readonly pendingOrders = computed(() => ...)
readonly completedOrders = computed(() => ...)

// Métodos
loadAddresses(): void
loadOrders(): void
loadUserProfile(): void
downloadInvoice(orderId: string): void
cancelOrder(orderId: string): void
updateUser(data: {...}): void
addAddress(address: ...): void
updateAddress(id: string, address: ...): void
deleteAddress(id: string): void
setDefaultAddress(id: string): void
```

### DataService
```typescript
// Carga inicial de productos, categorías, testimonios, combos
// en el constructor

readonly products = this.productsSignal.asReadonly();
readonly categories = this.categoriesSignal.asReadonly();
readonly testimonials = this.testimonialsSignal.asReadonly();
readonly featuredCombo = this.comboSignal.asReadonly();
```

### CategoryService
```typescript
readonly categories = this._categories.asReadonly();
readonly isLoading = this._isLoading.asReadonly();
readonly error = this._error.asReadonly();

loadCategories(): void
createCategory(data: Omit<Category, 'id'>): void
updateCategory(id: string, data: Omit<Category, 'id'>): void
deleteCategory(id: string): void
clearError(): void
```

### FavoritesService
```typescript
readonly favorites = computed(() => ...);
readonly favoriteIds = this.favoriteIdsSignal.asReadonly();
readonly favoriteCount = computed(() => this.favoriteIds().length);

loadFavorites(): void
isFavorite(productId: string): boolean
toggleFavorite(productId: string): void
```

### ReviewsService
```typescript
getReviews(productId: string): Observable<ProductReviews>
getUserReview(productId: string): Observable<Review | null>
addReview(productId: string, rating: number, comment: string): Observable<Review>
updateReview(reviewId: string, rating: number, comment: string): Observable<Review>
deleteReview(reviewId: string): Observable<void>
```

### PaymentService
```typescript
createPayment(orderId: string): Observable<PaymentResponse>
refundPayment(orderId: string): Observable<...>
getSettings(): Observable<PaymentSettings>
updateSettings(settings: Partial<PaymentSettings>): Observable<void>
```

### LegalService
```typescript
readonly terms = this.termsSignal.asReadonly();
readonly privacy = this.privacySignal.asReadonly();
readonly returns = this.returnsSignal.asReadonly();

getLegalDocument(type: 'terms' | 'privacy' | 'returns'): LegalDocument | null
```

### DashboardService
```typescript
getStats(): Observable<DashboardData>  // Stats del admin
```

## Modelos (Interfaces)

### ProductModel
```typescript
interface ProductModel {
  id: string;
  name: string;
  description: string;
  price: number;        // COP
  category: string;     // 'cafeteria' | 'pizzeria' | 'despensa' | 'combo'
  image: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isCombo?: boolean;
  stock: number;
  averageRating?: number;
  totalReviews?: number;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon?: string;        // Font Awesome class, ej: 'fa-mug-hot'
}
```

### UserModel
```typescript
interface UserModel {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: 'user' | 'admin' | 'employee' | 'delivery';
}
```

### Order
```typescript
interface Order {
  id: string;
  orderId: string;      // Ej: 'ORD-1774812369221'
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  deliveryAddress?: Address;
  deliveryPerson?: string;
  paymentMethod?: 'cash' | 'enzona';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  createdAt: Date | string;
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
```

### Address
```typescript
interface Address {
  id: string;
  label: string;       // 'Casa', 'Oficina'
  street?: string;
  number?: string;
  city?: string;
  neighborhood?: string;
  instructions?: string;
  isDefault?: boolean;
}
```

### Review
```typescript
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;       // 1-5
  comment: string;
  createdAt: Date | string;
}
```

## Guards (Funcionales)

### auth.guard.ts
```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) return true;
  
  router.navigate(['/login']);
  return false;
};
```

### admin.guard.ts
```typescript
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated() && authService.isAdmin()) return true;
  
  // Redirige a login o home
  return false;
};
```

## Interceptors

### auth.interceptor.ts
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};
```

## Lazy Loading

```typescript
// En app.routes.ts
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin-layout.component')
    .then(m => m.AdminLayoutComponent),
  canActivate: [adminGuard],
  children: [...]
}
```

## Environment

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api',
  authEndpoint: 'http://localhost:3000/api/auth',
  usersEndpoint: 'http://localhost:3000/api/users',
  ordersEndpoint: 'http://localhost:3000/api/orders',
};
```

## Tailwind CSS 4

**Sin tailwind.config.js** - Configuración directa en CSS:

```css
/* styles.css */
@import 'tailwindcss';

@theme {
  --color-brand: #a9431f;
  --color-brand-hover: #8a3619;
  --font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

## Iconos Font Awesome

Usar clases CSS directo o con binding:

```html
<!-- Directo -->
<i class="fas fa-shopping-cart"></i>

<!-- Dinámico desde categoría -->
<i [class]="category.icon || 'fas fa-folder'"></i>
```

## Roles de Usuario

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `user` | Cliente regular | Perfil, pedidos, favoritos, carrito |
| `admin` | Administrador | Todo incluyendo panel admin |
| `employee` | Empleado | Acceso parcial a pedidos |
| `delivery` | Repartidor | Acceso a pedidos para entregar |

## Convenciones de Código

1. **Componentes**: Todos standalone con imports explícitos
2. **Signals**: Usar `signal()`, `computed()`, `asReadonly()`
3. **OnPush**: Implicit in Angular 21 (optimizado)
4. **HTTP**: Observables con `HttpClient`
5. **Rutas**: Lazy loading con `loadComponent`
6. **Inyección**: `inject()` function en lugar de constructor

## Flujo de Auth

```
1. Login → POST /api/auth/login → { user, token }
2. Token guardado en localStorage
3. AuthService expone signals con user y estado
4. Guards verifican isAuthenticated() / isAdmin()
5. Interceptor añade Authorization: Bearer a cada request
```

## Notas Importantes

- **Cart expira**: 30 minutos sin actividad
- **Orders expiran**: 24 horas si no se confirman
- **Invoice download**: Soporta `?token=xxx` query param
- **EnZona**: Integración con payment processor cubano

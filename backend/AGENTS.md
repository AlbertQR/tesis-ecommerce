# Backend Agents - Doña Yoli

## Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: MongoDB con Mongoose ODM
- **Auth**: JWT (jsonwebtoken) - 7 días de expiración
- **Upload**: Multer - imágenes locales en `public/uploads`
- **Password**: bcryptjs
- **Validation**: Zod schemas
- **Payments**: Integración EnZona (payment processor cubano)
- **PDF**: pdfkit para facturas
- **QR**: qrcode para códigos en facturas
- **Email**: nodemailer
- **Excel**: xlsx para exportación
- **Testing**: Vitest

## Arquitectura General

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Conexión MongoDB + seed data
│   │   └── index.ts         # Config global (JWT, email, port)
│   ├── controllers/          # Lógica de negocio (separados por recurso)
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification + role authorization
│   │   └── upload.ts        # Multer config para imágenes
│   ├── models/              # Schemas Mongoose
│   ├── routes/              # Definición de rutas
│   ├── schemas/             # Validación Zod
│   ├── services/            # Integraciones externas (EnZona)
│   ├── utils/               # Helpers (email)
│   ├── app.ts               # Configuración Express
│   └── index.ts             # Punto de entrada
├── public/uploads/          # Imágenes de productos
├── invoices/                # PDFs de facturas generados
├── dist/                    # Código compilado
└── package.json
```

## Middleware de Auth

```typescript
// src/middleware/auth.ts

// Verifica JWT del header Authorization: Bearer <token>
authenticate

// Verifica rol === 'admin'
authorizeAdmin

// Verifica rol in ['admin', 'employee', 'delivery']
authorizeStaff

// Decodifica token si existe (no falla si no hay token)
optionalAuth
```

**Uso en rutas:**
```typescript
router.get('/secret', authenticate, authorizeAdmin, controller.method);
router.get('/public', optionalAuth, controller.method);  // Token opcional
```

## Modelos de Datos (Mongoose)

### User
```typescript
{
  email: string;              // Unique, index
  password: string;            // Hash bcrypt
  name: string;
  phone: string;
  avatar?: string;             // URL imagen perfil
  role: 'user' | 'admin' | 'employee' | 'delivery';
  favorites: string[];         // IDs de productos favoritos
  cart: ICartItem[];           // Carrito actual
  cartExpiresAt?: Date;       // Expiración del carrito (30 min)
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Product
```typescript
{
  name: string;
  description: string;
  price: number;              // COP
  category: 'cafeteria' | 'pizzeria' | 'despensa' | 'combo';
  image: string;              // URL
  isFeatured?: boolean;
  isHot?: boolean;            // Producto popular
  isCombo?: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category
```typescript
{
  id: string;                  // Ej: 'cafeteria' (único)
  name: string;
  description: string;
  image: string;
  icon: string;                // Font Awesome class, ej: 'fa-mug-hot'
}
```

### Order
```typescript
{
  userId: ObjectId;           // Ref a User
  orderId: string;            // Ej: 'ORD-1774812369221'
  date: Date;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: [{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    category?: string;
  }];
  subtotal: number;
  shipping: number;            // 100 COP si hay delivery
  total: number;
  deliveryAddress?: {
    label: string;
    street?: string;
    number?: string;
    city?: string;
    neighborhood?: string;
    instructions?: string;
  };
  deliveryPerson?: string;     // ID del repartidor
  invoiceUrl?: string;
  expiresAt: Date;             // 24 horas para confirmar
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'enzona';
  transactionUuid?: string;    // EnZona
  paymentConfirmUrl?: string;
  paymentCompleteUrl?: string;
  refundAmount?: number;
  refundPercentage?: number;
  refundTransactionUuid?: string;
}
```

### Address
```typescript
{
  userId: ObjectId;
  label: string;               // "Casa", "Oficina"
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Review
```typescript
{
  productId: string;
  userId: ObjectId;
  userName: string;
  rating: number;              // 1-5
  comment: string;             // 5-500 chars
  createdAt: Date;
  updatedAt: Date;
}
// Unique compound index: productId + userId
```

### Testimonial
```typescript
{
  name: string;
  role: string;                // "Cliente Frecuente"
  comment: string;
  rating: number;              // 1-5
  initials: string;            // Para avatar sin imagen
  image?: string;
}
```

### Combo
```typescript
{
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  includes: string[];          // Lista de items incluidos
  isFeatured?: boolean;
  discount?: number;
}
```

### Content
```typescript
{
  key: string;                 // Ej: 'home_hero_title' (único)
  value: string;
  type: 'text' | 'image' | 'json';
}
```

### Legal
```typescript
{
  type: 'terms' | 'privacy' | 'returns';  // Único por tipo
  title: string;
  content: string;             // HTML
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Settings
```typescript
{
  key: string;                 // Única
  value: string;
}
// Defaults:
{
  enzona_consumer_key: '',
  enzona_consumer_secret: '',
  enzona_merchant_uuid: '',
  refund_percentage: '80',
  refund_enabled: 'true'
}
```

## Rutas API - Auth (/api/auth)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Registrar nuevo usuario |
| POST | `/login` | ❌ | Iniciar sesión → `{ user, token }` |
| POST | `/forgot-password` | ❌ | Solicitar reset de contraseña |
| POST | `/reset-password` | ❌ | Restablecer contraseña con token |
| GET | `/me` | ✅ | Obtener usuario actual |

## Rutas API - Products (/api/products)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Listar productos (filtros: category, featured, hot, combo, search) |
| GET | `/:id` | ❌ | Obtener producto por ID |
| POST | `/` | ✅ admin | Crear producto |
| PUT | `/:id` | ✅ admin | Actualizar producto |
| DELETE | `/:id` | ✅ admin | Eliminar producto |

**Query params para GET /:**
- `category`: filtrar por categoría
- `featured`: boolean
- `hot`: boolean
- `combo`: boolean
- `search`: búsqueda por nombre

## Rutas API - Categories (/api/categories)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Listar categorías activas |
| POST | `/` | ✅ admin | Crear categoría |
| PUT | `/:id` | ✅ admin | Actualizar categoría |
| DELETE | `/:id` | ✅ admin | Eliminar categoría |

## Rutas API - Orders (/api/orders)

### Carrito
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/cart` | ✅ | Obtener carrito del usuario |
| POST | `/cart` | ✅ | Agregar producto al carrito |
| PUT | `/cart/:productId` | ✅ | Actualizar cantidad |
| DELETE | `/cart/:productId` | ✅ | Eliminar item del carrito |
| DELETE | `/cart` | ✅ | Vaciar carrito |

### Pedidos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/checkout` | ✅ | Crear pedido desde carrito |
| GET | `/orders` | ✅ | Pedidos del usuario |
| GET | `/orders/:id` | ✅ | Detalle del pedido |
| DELETE | `/orders/:id` | ✅ (owner) | Cancelar pedido |
| GET | `/orders/:id/invoice` | ✅ | Descargar factura PDF |
| POST | `/verify-qr` | ✅ staff | Verificar pedido por QR (TPV) |

## Rutas API - Admin Orders (/api/admin/orders)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | ✅ staff | Todos los pedidos (filtros: status, date) |
| PUT | `/:id/status` | ✅ staff | Actualizar estado (pending→confirmed→preparing→ready→delivered) |
| PUT | `/:id/delivery` | ✅ staff | Asignar repartidor |
| PUT | `/:id/payment` | ✅ staff | Confirmar pago (cash) |

## Rutas API - Users (/api/users)

### Perfil
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/profile` | ✅ | Obtener perfil + direcciones |
| PUT | `/profile` | ✅ | Actualizar perfil |
| GET | `/addresses` | ✅ | Listar direcciones |
| POST | `/addresses` | ✅ | Crear dirección |
| PUT | `/addresses/:id` | ✅ | Actualizar dirección |
| DELETE | `/addresses/:id` | ✅ | Eliminar dirección |
| PUT | `/addresses/:id/default` | ✅ | Establecer por defecto |

### Favoritos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/favorites` | ✅ | Obtener favoritos |
| POST | `/favorites` | ✅ | Agregar favorito |
| DELETE | `/favorites/:productId` | ✅ | Eliminar favorito |

### Admin
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/admin/users` | ✅ admin | Todos los usuarios |
| PUT | `/admin/users/:id` | ✅ admin | Actualizar usuario |
| DELETE | `/admin/users/:id` | ✅ admin | Eliminar usuario |

## Rutas API - Reviews (/api/reviews)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/products/:productId/reviews` | ❌ | Reseñas de producto |
| GET | `/products/:productId/reviews/me` | ✅ | Mi reseña del producto |
| POST | `/reviews` | ✅ | Crear reseña (requiere compra previa) |
| PUT | `/reviews/:id` | ✅ (owner) | Actualizar reseña |
| DELETE | `/reviews/:id` | ✅ (owner) | Eliminar reseña |

**Validación**: Solo usuarios que han comprado el producto pueden reseñar.

## Rutas API - Content (/api/testimonials, /api/combos, /api/contents)

### Testimonials
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/testimonials` | ❌ | Listar testimonios activos |
| POST | `/testimonials` | ✅ admin | Crear testimonio |
| PUT | `/testimonials/:id` | ✅ admin | Actualizar |
| DELETE | `/testimonials/:id` | ✅ admin | Eliminar |

### Combos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/combos` | ❌ | Listar combos (filtro: featured) |
| GET | `/combos/:id` | ❌ | Obtener combo |
| POST | `/combos` | ✅ admin | Crear combo |
| PUT | `/combos/:id` | ✅ admin | Actualizar |
| DELETE | `/combos/:id` | ✅ admin | Eliminar |

### Contents
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/contents` | ❌ | Listar contenidos |
| GET | `/contents/:key` | ❌ | Obtener contenido |
| POST | `/contents` | ✅ admin | Crear |
| PUT | `/contents/:key` | ✅ admin | Actualizar |
| DELETE | `/contents/:key` | ✅ admin | Eliminar |

## Rutas API - Legal (/api/legal)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Documentos activos |
| GET | `/:type` | ❌ | Documento por tipo (terms/privacy/returns) |
| GET | `/admin/legal` | ✅ admin | Todos los documentos |
| POST | `/admin/legal` | ✅ admin | Crear |
| PUT | `/admin/legal/:type` | ✅ admin | Actualizar |
| DELETE | `/admin/legal/:type` | ✅ admin | Eliminar |

## Rutas API - Other

### Dashboard
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | ✅ admin | Estadísticas completas |

### Payments
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Crear pago EnZona |
| GET | `/callback` | ❌ | Callback de EnZona |
| GET | `/cancel` | ❌ | Cancelar pago |
| POST | `/refund` | ✅ admin | Procesar reembolso |
| GET | `/settings` | ✅ admin | Obtener settings |
| PUT | `/settings` | ✅ admin | Actualizar settings |

### Upload
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/` | ✅ admin | Subir imagen → `{ url }` |

### Contact
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/` | ❌ | Enviar formulario de contacto |

### Export
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/orders` | ✅ admin | Exportar pedidos a Excel |

### Health
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Estado del servidor |

## Seed Data

Se ejecuta automáticamente en `database.ts` cuando `User.countDocuments() === 0`:

### Usuarios
| Email | Password | Rol |
|-------|----------|-----|
| admin@dona-yoli.com | 4dminRoot | admin |

### Categorías
| ID | Name | Icon |
|----|------|------|
| cafetería | Cafetería | fa-mug-hot |
| pizzeria | Pizzería | fa-pizza-slice |
| despensa | Despensa | fa-basket-shopping |

### Productos (12 items)
- **Combos**: Combo Familiar, Combo Desayuno, Combo Pizza + Refresco, Combo Despensa
- **Pizzeria**: Pizza Pepperoni, Pizza Vegetariana
- **Cafetería**: Latte Caramel, Pastel de Chocolate, Cupcake Vainilla
- **Despensa**: Harina 1kg, Aceite Oliva 500ml, Arroz Premium 1kg

### Testimonios (3)
- María Rodríguez (Cliente Frecuente, 5 estrellas)
- Juan Pérez (Amante del Café, 5 estrellas)
- Laura Castro (Foodie, 4.5 estrellas)

### Documentos Legales
- Términos y Condiciones
- Política de Privacidad
- Política de Devoluciones

### Settings
```
enzona_consumer_key: ''
enzona_consumer_secret: ''
enzona_merchant_uuid: ''
refund_percentage: '80'
refund_enabled: 'true'
```

## Features Especiales

### Carrito con Expiración
- Expira en **30 minutos** sin actividad
- Cleanup automático cada 60 segundos
- Al expirar restaura el stock de productos

### Pedidos con Expiración
- Expiran en **24 horas** si no se confirman
- Cleanup automático cada 60 segundos
- Al expirar se cancelan y restaura stock

### Facturas PDF
- Generadas automáticamente en `/invoices/`
- Incluyen código QR para verificación
- Formato en pesos colombianos (COP)
- Descargables via `GET /orders/:id/invoice?token=xxx`

### EnZona Integration
- Payment processor cubano
- Soporte para reembolsos (porcentaje configurable)
- Callback para confirmación de pago
- Configurable via Settings

### Review Validation
- Solo usuarios con **compra confirmada** del producto
- Unique: una reseña por usuario por producto
- Límite de caracteres: 5-500

## Roles de Usuario

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `user` | Cliente regular | Perfil, pedidos, favoritos, carrito |
| `admin` | Administrador | Todo + panel admin |
| `employee` | Empleado | Acceso a pedidos (cocina) |
| `delivery` | Repartidor | Pedidos asignados |

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Validación fallida |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Conflicto (ej: email duplicado) |
| 500 | Server Error - Error interno |

## JWT

```typescript
// Configuración
JWT_SECRET=dona-yoli-secret-key-2024  // o variable env
JWT_EXPIRES_IN=7d

// Payload
{
  id: user._id,
  email: user.email,
  role: user.role
}
```

## Dependencias Principales

```json
{
  "express": "^4.21.0",
  "mongoose": "^9.3.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "multer": "^2.1.1",
  "nodemailer": "^6.10.1",
  "pdfkit": "^0.15.0",
  "qrcode": "^1.5.4",
  "xlsx": "^0.18.5",
  "zod": "^3.23.8",
  "axios": "^1.13.6"
}
```

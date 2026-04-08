# Doña Yoli - Project Overview

## Descripción

E-commerce completo para restaurant/cafetería con tres componentes:

- **Frontend**: Angular 21 SPA para clientes
- **Backend**: Express API para lógica de negocio
- **TPV**: Flutter app para empleados (cobro y entrega)

## Quick Start

```bash
# 1. MongoDB debe estar corriendo
mongod

# 2. Backend (puerto 3000)
cd backend && npm install && npm run dev

# 3. Frontend (puerto 4200)
cd frontend && npm install && npm start

# 4. TPV (emulador/dispositivo)
cd tpv && flutter pub get && flutter run
```

## Estructura del Proyecto

```
software/
├── frontend/          # Angular 21 SPA
│   ├── src/app/       # Componentes, servicios, modelos
│   ├── AGENTS.md      # Convenciones Angular detalladas
│   └── package.json
├── backend/           # Express + MongoDB
│   ├── src/           # Controllers, models, routes, middleware
│   ├── invoices/      # PDFs de facturas generados
│   ├── public/uploads/ # Imágenes de productos
│   ├── AGENTS.md      # API endpoints, modelos, auth
│   └── package.json
├── tpv/              # Flutter app
│   ├── lib/          # Screens, services
│   ├── AGENTS.md      # TPV flow, QR scanning
│   └── pubspec.yaml
└── AGENTS.md         # Este archivo
```

## Credenciales de Prueba

### Backend Seed (admin@dona-yoli.com / 4dminRoot)
| Email | Password | Rol |
|-------|----------|-----|
| admin@dona-yoli.com | 4dminRoot | admin |

### Roles Disponibles
| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `user` | Cliente regular | Perfil, pedidos, carrito |
| `admin` | Administrador | Todo |
| `employee` | Empleado | Pedidos (cocina) |
| `delivery` | Repartidor | Pedidos delivery |

## URLs y Puertos

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:4200 | SPA clientes |
| Backend API | http://localhost:3000/api | REST API |
| MongoDB | mongodb://localhost:27017/dona-yoli | Database |

## Configuración de Entorno

### Frontend (frontend/src/environments/environment.ts)
```typescript
apiUrl: 'http://localhost:3000/api'
```

### Backend (backend/src/config/index.ts)
```typescript
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dona-yoli
JWT_SECRET=dona-yoli-secret-key-2024
JWT_EXPIRES_IN=7d
```

## Base de Datos

- **Motor**: MongoDB
- **ODM**: Mongoose
- **URI**: `mongodb://localhost:27017/dona-yoli`
- **Seed**: Automático en primer run si no hay usuarios

## Authentication

- **Tipo**: JWT (JSON Web Tokens)
- **Expiración**: 7 días
- **Storage Frontend**: localStorage
- **Storage TPV**: SharedPreferences
- **Header**: `Authorization: Bearer <token>`

## Modelos de Datos Principales

### User
```
id, email*, password, name, phone, avatar, role
favorites[], cart[], cartExpiresAt
* único
```

### Product
```
id, name, description, price, category
image, isFeatured, isHot, isCombo, stock
```

### Category
```
id*, name, description, image, icon (Font Awesome)
* único
```

### Order
```
id, orderId (ORD-xxxxx), userId, status
items[], subtotal, shipping, total
deliveryAddress, deliveryPerson
paymentMethod (cash|enzona), paymentStatus
invoiceUrl, expiresAt
```

### Review
```
productId, userId, userName
rating (1-5), comment, createdAt
* único: productId + userId
```

## Estados de Pedido

```
pending → confirmed → preparing → ready → delivered
    ↓                              ↓
 cancelled                      cancelled
```

## Features Principales

### Frontend Web
- Catálogo con filtros (categoría, precio, búsqueda)
- Carrito con expiración (30 min)
- Checkout con delivery o recojo
- Reseñas de productos (requiere compra)
- Favoritos
- Perfil con direcciones
- Panel admin completo
- Descarga de facturas PDF

### Backend API
- CRUD completo de productos, categorías, usuarios
- Gestión de pedidos con estados
- Pagos EnZona integration
- Generación de facturas PDF con QR
- Limpieza automática de carritos/pedidos expirados
- Validación Zod en inputs

### TPV App
- Login de empleados
- Escaneo QR para identificar pedidos
- Confirmación de pago en efectivo
- Marcado de entrega
- Lista de pedidos pendientes

## Expiraciones Automáticas

| Recurso | TTL | Acción al expirar |
|---------|-----|-------------------|
| Cart | 30 min | Limpia items, restaura stock |
| Order | 24 horas | Cancela, restaura stock |

## Constantes de Negocio

```typescript
// Delivery
DELIVERY_FEE = 100 COP

// Order ID format
orderId = 'ORD-' + timestamp

// Payment
PAYMENT_METHODS = ['cash', 'enzona']
PAYMENT_STATUS = ['pending', 'paid', 'refunded']

// Refund (configurable)
DEFAULT_REFUND_PERCENTAGE = 80%
```

## Categorías Default (Seed)

| ID | Nombre | Icono |
|----|--------|-------|
| cafetería | Cafetería | fa-mug-hot |
| pizzeria | Pizzería | fa-pizza-slice |
| despensa | Despensa | fa-basket-shopping |

## Flujo de Pedido

```
1. Usuario agrega productos al carrito
2. Checkout → Crea Order (status: pending)
3. Pago:
   - Cash → Espera confirmación TPV
   - EnZona → Redirect a plataforma de pago
4. TPV escanea QR del pedido
5. TPV confirma pago (cash) o entrega
6. Order status → delivered
7. Usuario puede descargar factura
```

## Rutas API Principales

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products & Categories
- `GET /api/products` (filtros: category, search, featured, hot)
- `GET /api/categories`

### Orders
- `POST /api/orders/checkout`
- `GET /api/orders/orders`
- `GET /api/orders/:id`
- `PUT /api/admin/orders/:id/status`
- `PUT /api/admin/orders/:id/payment`

### TPV
- `POST /api/auth/login` (empleado)
- `GET /api/orders/:id` (detalle)
- `POST /api/verify-qr` (desde TPV)

## Documentación Específica

Para información detallada de cada componente:

- [frontend/AGENTS.md](frontend/AGENTS.md) — Angular, signals, servicios, routing
- [backend/AGENTS.md](backend/AGENTS.md) — Express, controllers, routes, MongoDB
- [tpv/AGENTS.md](tpv/AGENTS.md) — Flutter, screens, API, QR scanning

## Issues Conocidos

1. **Cart expira**: 30 minutos sin actividad
2. **Orders expiran**: 24 horas sin confirmar
3. **TPV Base URL**: Hardcodeada como localhost (cambiar para producción)
4. **JWT decode en TPV**: Manual sin validación de firma

## Comandos Útiles

```bash
# Frontend
cd frontend && npm start           # Dev server (4200)
cd frontend && npm run build       # Production build

# Backend
cd backend && npm run dev          # Dev con ts-node
cd backend && npm run build        # Compila a dist/
cd backend && npm start            # Production (dist/)

# TPV
cd tpv && flutter run             # Debug
cd tpv && flutter run --release   # Release
```

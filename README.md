# Doña Yoli - Ecommerce

![Doña Yoli - Cafetería, Pizzeria y Despensa](./Screenshot.png)

**Doña Yoli** es una aplicación de comercio electrónico completa para un negocio de cafetería, pizzeria y despensa. Permite a los clientes explorar productos, agregar al carrito, realizar pedidos y gestionar su perfil.

## Características

### Para Clientes
- 🛒 **Catálogo de productos** - Explora productos por categorías (Cafetería, Pizzeria, Despensa, Combos)
- 🔍 **Filtros avanzados** - Busca productos por nombre, categoría, precio y más
- 🛍️ **Carrito de compras** - Agrega productos, modifica cantidades y gestiona tu pedido
- 📦 **Sistema de pedidos** - Solicita entrega a domicilio o recoge en tienda
- 👤 **Gestión de perfil** - Actualiza tus datos y gestiona direcciones de entrega
- 📋 **Historial de pedidos** - Revisa tus pedidos anteriores y su estado

### Para Administradores
- 📊 **Dashboard** - Visualiza estadísticas de ventas y pedidos recientes
- 👥 **Gestión de usuarios** - Administra usuarios y sus roles
- 🍕 **Gestión de productos** - CRUD completo de productos y categorías
- 📑 **Gestión de pedidos** - Actualiza el estado de los pedidos
- 📝 **Contenido dinámico** - Gestiona testimonios, combos y contenido del sitio
- 📜 **Documentos legales** - Configura términos, privacidad y devoluciones

## Tecnologías

### Frontend
- **Angular 21** - Framework principal
- **Tailwind CSS 4** - Estilos
- **TypeScript** - Lenguaje tipado
- **Signals** - Estado reactivo

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM
- **JWT** - Autenticación
- **PDFKit** - Generación de facturas

## Estructura del Proyecto

```
├── frontend/                 # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Servicios, interceptores, guards
│   │   │   ├── features/   # Componentes de páginas
│   │   │   └── shared/     # Componentes compartidos
│   │   └── styles.css      # Estilos globales
│   └── angular.json
│
├── backend/                  # API Express
│   ├── src/
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── middleware/     # Middleware de autenticación
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Rutas de la API
│   │   ├── schemas/        # Validación con Zod
│   │   └── config/         # Configuración
│   └── package.json
│
├── Screenshot.png           # Captura de pantalla del proyecto
├── requisitos-funcionales.md
├── requisitos-no-funcionales.md
└── AGENTS.md               # Documentación de desarrollo
```

## Instalación

### Prerequisites
- Node.js 18+
- MongoDB (local o Atlas)
- npm o yarn

### Backend

```bash
cd backend
npm install
# Crear archivo .env con las variables de entorno necesarias
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Credenciales de Prueba

### Administrador
- Email: `admin@dona-yoli.com`
- Contraseña: `admin123`

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Datos del usuario actual |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |

### Carrito y Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cart` | Obtener carrito |
| POST | `/api/cart` | Agregar producto |
| PUT | `/api/cart/:productId` | Actualizar cantidad |
| DELETE | `/api/cart/:productId` | Eliminar producto |
| POST | `/api/checkout` | Procesar pedido |
| GET | `/api/orders` | Lista de pedidos |

### Contenido
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/testimonials` | Testimonios |
| GET | `/api/combos` | Combos disponibles |
| GET | `/api/contents/:key` | Contenido dinámico |

### Legal
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/legal/terms` | Términos y condiciones |
| GET | `/api/legal/privacy` | Política de privacidad |
| GET | `/api/legal/returns` | Política de devoluciones |

## Estado de Pedidos

- **pending** - Pedido recibido, esperando confirmación
- **confirmed** - Pedido confirmado
- **preparing** - Preparando el pedido
- **ready** - Listo para entrega/recolecta
- **delivered** - Entregado
- **cancelled** - Cancelado

## Licencia

MIT

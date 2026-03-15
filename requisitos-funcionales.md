# Requisitos Funcionales - Doña Yoli Ecommerce

## 1. Autenticación y Usuarios

### 1.1 Registro de Usuarios
- El usuario debe poder registrarse proporcionando: nombre, email, teléfono y contraseña
- Validación de datos con Zod (email válido, contraseña mínimo 6 caracteres)
- El sistema debe verificar que el email no esté duplicado

### 1.2 Inicio de Sesión
- El usuario debe poder iniciar sesión con email y contraseña
- Generación de token JWT al iniciar sesión exitosamente
- Persistencia del token JWT en localStorage del navegador
- **IMPORTANTE**: Solo se almacena el token JWT, los datos del usuario se extraen del payload del JWT
- Validación de expiración del token automáticamente

### 1.3 Perfil de Usuario
- Visualización de datos del perfil (nombre, email, teléfono)
- Actualización de información del perfil
- Visualización del historial de pedidos

### 1.4 Gestión de Direcciones
- Crear nuevas direcciones de entrega
- Editar direcciones existentes
- Eliminar direcciones
- Establecer dirección predeterminada
- Cada dirección debe incluir: etiqueta, calle, número, ciudad, barrio, instrucciones opcionales

---

## 2. Catálogo de Productos

### 2.1 Visualización de Productos
- Listado de todos los productos en la página de productos
- Filtrado por categoría (Cafetería, Pizzería, Despensa, Combos)
- Búsqueda de productos por nombre o descripción
- Ordenamiento por: popularidad, nombre, precio (asc/desc)
- Visualización de productos destacados en el home

### 2.2 Información de Productos
- Nombre del producto
- Descripción
- Precio
- Imagen
- Categoría
- Indicador de producto destacado (featured)
- Indicador de producto hot (popular)
- Stock disponible

### 2.3 Gestión de Productos (Administrador)
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Gestionar stock (aumentar/disminuir cantidad)
- Marcar como destacado o hot
- Asignar categoría

---

## 3. Carrito de Compras

### 3.1 Gestión del Carrito
- Agregar productos al carrito (solo usuarios autenticados)
- Redirección a login si no está autenticado
- Ver contenido del carrito
- Modificar cantidad de productos (+/-)
- Eliminar productos del carrito
- Vaciar carrito completamente

### 3.2 Cálculos
- Subtotal por producto (precio × cantidad)
- Subtotal total del carrito
- Costo de envío (envío fijo de $100)
- Total general

### 3.3 Expiración del Carrito
- **IMPLEMENTADO**: El carrito expira después de 30 minutos de inactividad
- **IMPLEMENTADO**: Al expirar, el stock de los productos se restaura automáticamente
- Limpieza automática cada 60 segundos en el backend

---

## 4. Proceso de Compra (Checkout)

### 4.1 Flujo de Compra
- Selección de dirección de entrega
- Opción de entrega a domicilio o recogida en tienda
- Confirmación del pedido

### 4.2 Gestión de Stock
- Verificación de stock disponible antes de procesar
- Reducción automática del stock al confirmar pedido
- Mensaje de error si stock insuficiente

### 4.3 Generación de Pedido
- Creación de pedido con estado inicial "pending"
- Registro de productos comprados
- Registro de dirección de entrega
- Cálculo de totales

### 4.4 Expiración de Pedidos
- **IMPLEMENTADO**: Los pedidos expiran después de 24 horas si no son entregados
- **IMPLEMENTADO**: Al expirar, el pedido se cancela automáticamente y el stock se restaura
- Limpieza automática cada 60 segundos en el backend

### 4.5 Verificación de Entrega por QR
- **IMPLEMENTADO**: La factura PDF incluye un código QR con el ID del pedido
- **IMPLEMENTADO**: Endpoint público `/api/orders/verify-qr` para verificar entrega
- El código QR permite marcar el pedido como "entregado" escaneándolo

---

## 5. Gestión de Pedidos

### 5.1 Pedidos de Usuario
- Visualización del historial de pedidos
- Estados: pending, confirmed, preparing, ready, delivered, cancelled
- Detalle de cada pedido (productos, cantidades, precios)
- Descarga de factura en PDF

### 5.2 Factura PDF con QR
- **IMPLEMENTADO**: Generación automática de factura PDF al completar pedido
- **IMPLEMENTADO**: Código QR en la factura para verificación de entrega
- Datos incluidos: número de pedido, fecha, datos del cliente, productos, cantidades, precios unitarios, subtotal, envío, total
- Descarga disponible desde la lista de pedidos del usuario

### 5.2 Gestión de Pedidos (Administrador)
- Visualización de todos los pedidos
- Filtrado por estado
- Actualización de estado del pedido
- Estados posibles: pending → confirmed → preparing → ready → delivered

---

## 6. Contenido del Sitio

### 6.1 Testimonios
- Visualización de testimonios en el home
- Gestión de testimonios (administrador): crear, editar, eliminar
- **IMPLEMENTADO**: Campo opcional de imagen para testimonios

### 6.2 Combos
- Visualización de combos destacados
- Gestión de combos (administrador): crear, editar, eliminar

### 6.3 Contenido Dinámico
- Gestión de contenidos del sitio (administrador)
-keys configurables para textos del sitio

---

## 7. Administración

### 7.1 Gestión de Usuarios (Administrador)
- Listar todos los usuarios
- Cambiar rol de usuario (cliente/admin)
- Eliminar usuarios

### 7.2 Dashboard
- Vista general del panel de administración

### 7.3 Subida de Imágenes
- **IMPLEMENTADO**: Endpoint `/api/upload` para subir imágenes
- **IMPLEMENTADO**: Soporte para productos, testimonios y contenido
- Almacenamiento en carpeta `public/uploads/`
- Archivos renombrados con UUID
- Formatos permitidos: jpeg, jpg, png, gif, webp (máx 5MB)

### 7.4 Protección de Rutas
- **IMPLEMENTADO**: Guards de autenticación para rutas protegidas
- **IMPLEMENTADO**: AdminGuard para rutas del panel de administración
- Rutas protegidas: `/perfil`, `/pedidos`, `/pedido/:id`, `/admin`
- Redirección a login si no autenticado
- Redirección a home si intenta acceder a admin sin permisos

---

## 8. Facturación

### 8.1 Generación de Factura PDF
- Generación automática de factura al completar pedido
- Datos incluidos: número de pedido, fecha, datos del cliente, productos, cantidades, precios unitarios, subtotal, envío, total
- Archivo PDF descargable por el usuario

### 8.2 Código QR de Verificación
- **IMPLEMENTADO**: Código QR en cada factura PDF
- El QR contiene: `{ orderId, action: 'verify' }`
- Escaneo permite verificar y marcar pedido como entregado
- Endpoint público para verificación: `POST /api/orders/verify-qr`

---

## 9. Categorías

### 9.1 Categorías de Productos
- Cafetería
- Pizzería
- Despensa
- Combos

### 9.2 Gestión de Categorías (Administrador)
- Crear nuevas categorías
- Editar categorías
- Eliminar categorías

---

## 10. Páginas Públicas del Sitio

### 10.1 Página de Inicio (Home)
- Hero section con imagen y llamada a la acción
- Categorías destacadas con imágenes
- Productos populares/destacados
- Combo especial destacado
- Testimonios de clientes
- Links a otras páginas

### 10.2 Página "Nosotros"
- Historia de Doña Yoli
- Misión y visión
- Valores de la empresa

### 10.3 Página de Contacto
- Información de contacto (teléfono, email, dirección)
- Horarios de atención
- Mapa de ubicación (opcional)

---

## 11. Notificaciones y Estados

### 11.1 Notificaciones de Pedido
- El usuario debe poder ver el estado actual de sus pedidos
- Estados claros: Pendiente, Confirmado, Preparando, Listo, Entregado, Cancelado

### 11.2 Mensajes de Feedback
- Confirmación al agregar producto al carrito
- Confirmación al completar un pedido
- Mensajes de error claros cuando falla algo

---

## 12. Validaciones de Negocio

### 12.1 Stock
- No permitir agregar más cantidad que el stock disponible
- No permitir checkout si algún producto no tiene stock

### 12.2 Carrito
- No permitir hacer checkout con carrito vacío
- Minimum de compra (opcional)

### 12.3 Direcciones
- Validar que haya al menos una dirección para hacer delivery

---

## 13. Datos de Prueba (Seed)

### 13.1 Productos Iniciales
- Productos precargados en cada categoría
- Imágenes de referencia
- Precios y descripciones

### 13.2 Usuario Administrador
- Cuenta admin por defecto: admin@dona-yoli.com / admin123

### 13.3 Testimonios
- Testimonios de ejemplo precargados

---

## 14. Experiencia de Usuario (UX)

### 14.1 Carrito Accesible
- Badge con cantidad en el navbar
- Acceso rápido desde cualquier página

### 14.2 Navegación Intuitiva
- Menú claro y organizado
- Breadcrumbs (opcional)
- Volver al inicio fácil

### 14.3 Productos sin Stock
- Mostrar claramente productos sin stock
- Opción de notificación cuando haya stock (opcional)

---

## 15. Información Legal

### 15.1 Términos y Condiciones (Completado)
- Definir términos de servicio
- Página pública en `/terminos`
- Gestión desde panel de administración `/admin/legal`
- Contenido HTML editable

### 15.2 Política de Privacidad (Completado)
- Definir política de privacidad
- Página pública en `/privacidad`
- Gestión desde panel de administración `/admin/legal`
- Contenido HTML editable

### 15.3 Política de Devoluciones (Completado)
- Definir política de devoluciones
- Página pública en `/devoluciones`
- Gestión desde panel de administración `/admin/legal`
- Contenido HTML editable

### 15.4 Navegación a Legal
- Links en el footer del sitio
- Dropdown "Información Legal" en navbar
- Links en menú móvil

---

## 16. Base de Datos

### 16.1 MongoDB Integration
- Conexión a MongoDB en `mongodb://localhost:27017/dona-yoli`
- Modelos Mongoose para todas las colecciones
- Seed automático de datos iniciales

### 16.2 Colecciones
- users: Usuarios del sistema (incluye campo `cart` y `cartExpiresAt`)
- addresses: Direcciones de entrega
- products: Catálogo de productos
- categories: Categorías de productos
- testimonials: Testimonios de clientes (incluye campo `image` opcional)
- combos: Combos promocionales
- orders: Pedidos realizados (incluye campo `expiresAt` para expiración)
- contents: Contenido dinámico del sitio
- legal: Documentos legales

### 16.3 Almacenamiento del Carrito
- **IMPLEMENTADO**: Carrito almacenado en MongoDB (modelo User)
- No依赖于 express-session
- Campo `cartExpiresAt` para controlar expiración de 30 minutos
- Limpieza automática de carritos expirados

---

## 17. Testing

### 17.1 Tests Backend (Vitest)
- Tests de autenticación (JWT, bcrypt)
- Tests de productos y categorías
- Tests de documentos legales
- Tests de cálculos de carrito
- Tests de estados de pedidos

### 17.2 Tests Frontend (Vitest + Angular)
- Tests de AuthService
- Tests de UserService
- Tests de DataService
- Tests de CartService
- Tests de LegalService
- Tests de authInterceptor

### 17.3 Cobertura
- Backend: 37+ tests
- Frontend: 19+ tests

---

## 18. Métricas y Analytics (Futuro)

### 18.1 Tracking
- Google Analytics opcional
- Eventos de compra

### 18.2 Dashboard de Ventas
- Total de pedidos
- Ingresos
- Productos más vendidos

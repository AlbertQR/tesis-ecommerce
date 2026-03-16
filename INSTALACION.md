# Manual de Instalación - Doña Yoli Ecommerce

## Tabla de Contenidos

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Instalación de Herramientas](#3-instalación-de-herramientas)
4. [Configuración del Entorno](#4-configuración-del-entorno)
5. [Instalación del Backend](#5-instalación-del-backend)
6. [Instalación del Frontend](#6-instalación-del-frontend)
7. [Configuración de MongoDB](#7-configuración-de-mongodb)
8. [Ejecución del Proyecto](#8-ejecución-del-proyecto)
9. [Configuración de Pagos EnZona](#9-configuración-de-pagos-enzona)
10. [Verificación de la Instalación](#10-verificación-de-la-instalación)
11. [Solución de Problemas](#11-solución-de-problemas)

---

## 1. Requisitos del Sistema

### Hardware Mínimo
- **Procesador**: Intel Core i3 o equivalente
- **Memoria RAM**: 4 GB (recomendado 8 GB)
- **Espacio en Disco**: 2 GB libres
- **Conexión a Internet**: Required para descargar dependencias

### Software Requerido
- **Sistema Operativo**: Windows 10/11, macOS, o Linux
- **Node.js**: Versión 18.x o superior
- **npm**: Versión 9.x o superior (incluido con Node.js)
- **Git**: Versión 2.x o superior
- **MongoDB**: Versión 6.x o superior (Community Server)
- **Editor de Código**: Visual Studio Code (recomendado)

---

## 2. Estructura del Proyecto

```
D:\software\
├── backend/                 # Servidor Express + TypeScript
│   ├── src/
│   │   ├── app.ts          # Configuración de Express
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── middleware/      # Middleware de autenticación
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Definición de rutas
│   │   ├── schemas/        # Esquemas de validación Zod
│   │   ├── services/       # Servicios (EnZona API)
│   │   └── utils/         # Utilidades
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Aplicación Angular 21
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Servicios, guards, interceptors
│   │   │   ├── features/  # Componentes de páginas
│   │   │   └── shared/    # Componentes reutilizables
│   │   ├── styles.css     # Estilos globales
│   │   └── main.ts        # Punto de entrada
│   ├── angular.json
│   └── package.json
│
├── requisitos-funcionales.md
├── requisitos-no-funcionales.md
├── AGENTS.md
└── README.md
```

---

## 3. Instalación de Herramientas

### 3.1 Instalar Node.js

1. Descargar Node.js desde: https://nodejs.org/
2. Seleccionar la versión LTS (recomendada)
3. Ejecutar el instalador y seguir las instrucciones
4. Verificar instalación:
   ```bash
   node --version    # Debe mostrar v18.x.x o superior
   npm --version     # Debe mostrar 9.x.x o superior
   ```

### 3.2 Instalar Git

1. Descargar Git desde: https://git-scm.com/
2. Ejecutar el instalador con opciones por defecto
3. Verificar instalación:
   ```bash
   git --version
   ```

### 3.3 Instalar MongoDB

#### Windows
1. Descargar MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Seleccionar:
   - Version: 6.0 (o latest)
   - Package: MSI
   - Platform: Windows
3. Ejecutar el instalador
4. Seleccionar "Complete" installation
5. Marcar "Install MongoDB as a Service"
6. Completed la instalación

#### macOS (con Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org
```

### 3.4 Instalar Visual Studio Code (Opcional)

1. Descargar desde: https://code.visualstudio.com/
2. Ejecutar el instalador
3. Instalar extensiones recomendadas:
   - Angular Language Service
   - Prettier - Code formatter
   - ESLint
   - MongoDB for VS Code

---

## 4. Configuración del Entorno

### 4.1 Clonar el Repositorio

```bash
cd D:\
git clone <URL_DEL_REPOSITORIO> software
cd software
```

### 4.2 Variables de Entorno

El proyecto usa un archivo `.env` en el backend. El archivo ya debería estar configurado con los valores predeterminados:

```env
# Backend
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dona-yoli
JWT_SECRET=dona_yoli_secret_key_2024
CORS_ORIGIN=http://localhost:4200

# EnZona (se configura desde el panel de admin)
# No es necesario configurar aquí
```

---

## 5. Instalación del Backend

### 5.1 Navegar al Directorio del Backend

```bash
cd D:\software\backend
```

### 5.2 Instalar Dependencias

```bash
npm install
```

Este comando instalará:
- express: Framework web
- mongoose: ODM para MongoDB
- jsonwebtoken: Autenticación JWT
- zod: Validación de datos
- pdfkit: Generación de PDFs
- qrcode: Generación de códigos QR
- multer: Upload de archivos
- cors: Cross-origin resource sharing
- dotenv: Variables de entorno
- bcryptjs: Hash de contraseñas
-typescript: Lenguaje
- ts-node-dev: Ejecución en desarrollo
- vitest: Testing

### 5.3 Compilar el Proyecto

```bash
npm run build
```

### 5.4 Verificar Instalación

```bash
# Verificar que se crearon los archivos compilados
ls dist/
```

---

## 6. Instalación del Frontend

### 6.1 Navegar al Directorio del Frontend

```bash
cd D:\software\frontend
```

### 6.2 Instalar Dependencias

```bash
npm install
```

Este comando instalará:
- @angular/core: Framework Angular
- @angular/router: Routing
- @angular/forms: Formularios
- tailwindcss: Estilos
- jwt-decode: Decodificación de JWT

### 6.3 Verificar Instalación

```bash
# Verificar node_modules
ls node_modules/@angular/core
```

---

## 7. Configuración de MongoDB

### 7.1 Iniciar MongoDB

#### Windows (como servicio)
MongoDB debería iniciarse automáticamente como servicio. Verificar:

```bash
# En PowerShell como Administrador
Get-Service MongoDB
```

Si no está ejecutándose:
```bash
Start-Service MongoDB
```

#### Manual (todas las plataformas)
```bash
mongod --dbpath "C:\data\db"
```

### 7.2 Verificar Conexión

```bash
# Conectar a MongoDB shell
mongosh

# Ver bases de datos
show dbs

# Salir
exit
```

### 7.3 Datos Iniciales (Seed)

El proyecto incluye un sistema de seed automático que crea:
- Usuario administrador: `admin@dona-yoli.com` / `admin123`
- Categorías: Cafetería, Pizzería, Despensa, Combos
- Productos de ejemplo en cada categoría
- Testimonios de clientes
- Contenido del sitio
- Documentos legales (términos, privacidad, devoluciones)

Los datos se crean automáticamente al iniciar el backend por primera vez.

---

## 8. Ejecución del Proyecto

### 8.1 Iniciar el Backend

```bash
cd D:\software\backend
npm run dev
```

Debería ver:
```
Server running on port 3000
Database connected: mongodb://localhost:27017/dona-yoli
```

### 8.2 Iniciar el Frontend

En una nueva terminal:

```bash
cd D:\software\frontend
npm start
```

Debería ver:
```
Local: http://localhost:4200/
```

### 8.3 Acceder a la Aplicación

1. Abrir navegador en: http://localhost:4200/
2. Verificar que la página principal carga correctamente

---

## 9. Configuración de Pagos EnZona

### 9.1 Obtener Credenciales EnZona

1. Registrarse en https://www.enzona.net/
2. Acceder al panel de comerciante
3. Obtener:
   - Consumer Key
   - Consumer Secret
   - Merchant UUID

### 9.2 Configurar desde el Panel de Admin

1. Iniciar sesión como administrador
2. Ir a: http://localhost:4200/admin/configuracion
3. Ingresar las credenciales de EnZona
4. Configurar porcentaje de reembolso (default 80%)
5. Guardar configuración

### 9.3 Verificar Configuración

Los pagos ahora estarán disponibles en el checkout:
- Efectivo (pago contra entrega)
- EnZona (pago digital)

---

## 10. Verificación de la Instalación

### 10.1 Pruebas de Funcionalidad

#### Registro e Inicio de Sesión
1. Ir a /registro
2. Crear una cuenta nueva
3. Verificar que inicia sesión automáticamente

#### Catálogo de Productos
1. Ir a /productos
2. Verificar que se cargan los productos
3. Probar filtros por categoría

#### Carrito de Compras
1. Agregar productos al carrito
2. Verificar que aparecen en el carrito
3. Modificar cantidades

#### Checkout
1. Completar el checkout
2. Seleccionar método de pago
3. Verificar creación del pedido

#### Descarga de Factura
1. Ir a /pedidos
2. Seleccionar un pedido
3. Descargar factura PDF

### 10.2 Pruebas de Admin

#### Dashboard
1. Iniciar sesión como admin
2. Ir a /admin
3. Verificar estadísticas en tiempo real

#### Gestión de Productos
1. Ir a /admin/productos
2. Crear, editar, eliminar productos

#### Configuración de Pagos
1. Ir a /admin/configuracion
2. Configurar credenciales EnZona
3. Guardar y verificar

---

## 11. Solución de Problemas

### Error: MongoDB connection failed

**Problema**: No se puede conectar a MongoDB

**Solución**:
1. Verificar que MongoDB está ejecutándose:
   ```bash
   # Windows
   Get-Service MongoDB
   
   # Linux/Mac
   sudo systemctl status mongod
   ```
2. Verificar que la URI en `.env` es correcta:
   ```
   MONGODB_URI=mongodb://localhost:27017/dona-yoli
   ```

### Error: Puerto en uso

**Problema**: El puerto 3000 o 4200 está ocupado

**Solución**:
1. Cambiar puerto en la configuración
2. O matar el proceso que usa el puerto:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Error: Dependencias no instaladas

**Problema**: Faltan módulos de node

**Solución**:
```bash
# Limpiar cache e instalar
rm -rf node_modules package-lock.json
npm install
```

### Error: TypeScript compilation errors

**Problema**: Errores de compilación TypeScript

**Solución**:
```bash
# Reinstalar dependencias de TypeScript
npm install typescript@latest -g
cd backend
npm install
```

### Error: CORS policy

**Problema**: Error de CORS en el navegador

**Solución**:
1. Verificar CORS_ORIGIN en `.env`
2. Debe coincidir con la URL del frontend

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@dona-yoli.com | admin123 |
| Cliente | cliente@test.com | cliente123 |

---

## Comandos Rápidos

```bash
# Iniciar todo el proyecto
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start

# Tests backend
cd backend && npm test:run

# Tests frontend
cd frontend && npm test

# Build producción
cd backend && npm run build
cd frontend && npm run build
```

---

## Soporte

Para problemas o preguntas:
- Consultar AGENTS.md para detalles técnicos
- Revisar requisitos-funcionales.md para funcionalidades
- Revisar requisitos-no-funcionales.md para especificaciones técnicas

---

**Versión del Documento**: 1.0
**Fecha de Creación**: Marzo 2026
**Proyecto**: Doña Yoli Ecommerce

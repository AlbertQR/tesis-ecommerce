# Manual de Instalación - Doña Yoli Ecommerce

## Tabla de Contenidos

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Instalación con Docker (Recomendado)](#3-instalación-con-docker-recomendado)
4. [Instalación Manual](#4-instalación-manual)
5. [Instalación de la App TPV](#5-instalación-de-la-app-tpv)
6. [Configuración de MongoDB](#6-configuración-de-mongodb)
7. [Ejecución del Proyecto](#7-ejecución-del-proyecto)
8. [Configuración de Pagos EnZona](#8-configuración-de-pagos-enzona)
9. [Verificación de la Instalación](#9-verificación-de-la-instalación)
10. [Solución de Problemas](#10-solución-de-problemas)

---

## 1. Requisitos del Sistema

### Hardware Mínimo
- **Procesador**: Intel Core i3 o equivalente
- **Memoria RAM**: 4 GB (recomendado 8 GB)
- **Espacio en Disco**: 10 GB libres
- **Conexión a Internet**: Requerida para descargar dependencias

### Software Requerido
- **Sistema Operativo**: Windows 10/11, macOS, o Linux
- **Docker**: Versión 20.x o superior (para instalación con Docker)
- **Docker Compose**: Versión 2.x o superior
- **Git**: Versión 2.x o superior
- **Editor de Código**: Visual Studio Code (recomendado)

### Para App TPV (Flutter)
- **Flutter SDK**: Versión 3.7 o superior
- **Android Studio** (para Android) o Xcode (para iOS)
- **Dispositivo**: Android 5.0+ o iOS 12+

---

## 2. Estructura del Proyecto

```
software/
├── backend/                 # Servidor Express + TypeScript
│   ├── src/
│   │   ├── app.ts          # Configuración de Express
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── middleware/    # Middleware de autenticación
│   │   ├── models/        # Modelos Mongoose
│   │   ├── routes/        # Definición de rutas
│   │   ├── schemas/       # Esquemas de validación Zod
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
├── tpv/                    # App Flutter para empleados
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/       # Pantallas de la app
│   │   └── services/      # Servicios API
│   └── pubspec.yaml
│
├── docker-compose.yml      # Configuración Docker
├── Dockerfile.backend      # Imagen del backend
├── Dockerfile.frontend    # Imagen del frontend
└── nginx.conf            # Configuración nginx
```

---

## 3. Instalación con Docker (Recomendado)

### 3.1 Instalar Docker

#### Windows/macOS
1. Descargar Docker Desktop desde: https://www.docker.com/products/docker-desktop/
2. Ejecutar el instalador
3. Seguir las instrucciones del asistente
4. Verificar instalación:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

### 3.2 Configuración de Docker

El proyecto incluye `docker-compose.yml` con todos los servicios:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/dona-yoli
      - JWT_SECRET=dona_yoli_secret_key_2024
      - CORS_ORIGIN=http://localhost
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

### 3.3 Archivos Dockerfile

**Dockerfile.backend:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

**Dockerfile.frontend:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/angular21-tailwind/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.4 Iniciar con Docker

```bash
# Clonar repositorio
cd software

# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver estado de servicios
docker-compose ps
```

### 3.5 Servicios Disponibles

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost/api |
| MongoDB | localhost:27017 |

### 3.6 Detener Docker

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar
docker-compose restart
```

---

## 4. Instalación Manual

### 4.1 Requisitos Previos

- **Node.js**: Versión 18.x o superior
- **npm**: Versión 9.x o superior
- **MongoDB**: Versión 6.x o superior
- **Git**: Versión 2.x o superior

### 4.2 Instalar Node.js

1. Descargar desde: https://nodejs.org/
2. Seleccionar versión LTS
3. Verificar:
   ```bash
   node --version
   npm --version
   ```

### 4.3 Instalar MongoDB

#### Windows
1. Descargar desde: https://www.mongodb.com/try/download/community
2. Ejecutar instalador MSI
3. Instalar como servicio

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux
```bash
sudo apt update
sudo apt install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org
```

### 4.4 Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO> software
cd software
```

### 4.5 Instalar Backend

```bash
cd backend
npm install
npm run build
```

### 4.6 Instalar Frontend

```bash
cd frontend
npm install
```

### 4.7 Variables de Entorno

Crear archivo `backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dona-yoli
JWT_SECRET=dona_yoli_secret_key_2024
CORS_ORIGIN=http://localhost:4200
```

---

## 5. Instalación de la App TPV

La app TPV (Terminal Punto de Venta) es una aplicación Flutter para que los empleados gestionen pedidos.

### 5.1 Requisitos

- **Flutter SDK**: 3.7 o superior
- **Android Studio** (Android) o Xcode (iOS)
- **Dispositivo físico** o **emulador**

### 5.2 Instalar Flutter

#### Windows
1. Descargar Flutter SDK desde: https://docs.flutter.dev/get-started/install/windows
2. Extraer en `C:\flutter`
3. Agregar al PATH: `C:\flutter\bin`
4. Verificar:
   ```bash
   flutter doctor
   flutter --version
   ```

#### macOS
```bash
brew install flutter
flutter doctor
```

#### Linux
```bash
sudo snap install flutter --classic
flutter doctor
```

### 5.3 Configurar Dispositivo

**Android:**
1. Habilitar Debug USB en el dispositivo
2. Conectar por USB
3. Verificar:
   ```bash
   flutter devices
   ```

**Emulador Android:**
```bash
flutter emulators --create --name android_device
flutter emulators --launch android_device
```

### 5.4 Instalar Dependencias

```bash
cd tpv
flutter pub get
```

### 5.5 Configuración de API

Editar `lib/services/api_service.dart`:

```dart
class ApiService {
  // Para desarrollo local (web)
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Para producción (cambiar IP)
  // static const String baseUrl = 'http://192.168.1.100:3000/api';
}
```

### 5.6 Ejecutar en Modo Desarrollo

```bash
cd tpv
flutter run
```

### 5.7 Construir APK

```bash
cd tpv

# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release
```

La APK se genera en: `tpv/build/app/outputs/flutter-apk/app-release.apk`

### 5.8 Instalar APK en Dispositivo

```bash
# Con dispositivo conectado por USB
flutter install

# O instalar manualmente
adb install build/app/outputs/flutter-apk/app-release.apk
```

### 5.9 Roles de Usuario en TPV

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **employee** | Empleado de tienda | Ver pedidos, actualizar estados, escanear QR |
| **delivery** | Repartidor | Ver pedidos listos, marcar como entregados |

### 5.10 Usar la App TPV

1. **Login**: Usar credenciales de empleado/delivery
2. **Órdenes**: Ver lista de pedidos pendientes
3. **Scanner**: Escanear código QR de la factura del cliente
4. **Actualizar Estados**: Cambiar estado del pedido

---

## 6. Configuración de MongoDB

### 6.1 Iniciar MongoDB

```bash
# Windows (servicio)
Start-Service MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 6.2 Verificar Conexión

```bash
mongosh
show dbs
exit
```

### 6.3 Datos Iniciales (Seed)

El proyecto incluye seed automático:
- Admin: `admin@dona-yoli.com` / `admin123`
- Categorías y productos de ejemplo
- Testimonios y contenido
- Documentos legales

---

## 7. Ejecución del Proyecto

### 7.1 Con Docker

```bash
docker-compose up -d
```

### 7.2 Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 7.3 URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| TPV App | http://localhost (dispositivo) |

---

## 8. Configuración de Pagos EnZona

### 8.1 Obtener Credenciales

1. Registrarse en https://www.enzona.net/
2. Obtener: Consumer Key, Consumer Secret, Merchant UUID

### 8.2 Configurar en Admin

1. Login como admin
2. Ir a: http://localhost:4200/admin/configuracion
3. Ingresar credenciales de EnZona
4. Configurar porcentaje de reembolso

---

## 9. Verificación de la Instalación

### 9.1 Probar Frontend
1. Abrir http://localhost:4200/
2. Verificar página principal

### 9.2 Probar API
```bash
curl http://localhost:3000/api/products
```

### 9.3 Probar Login
1. Ir a /registro
2. Crear cuenta
3. Verificar autenticación

### 9.4 Probar TPV
1. Conectar dispositivo o emulador
2. Ejecutar `flutter run`
3. Login con credenciales de empleado

---

## 10. Solución de Problemas

### Error: MongoDB connection failed
```bash
# Verificar servicio
Get-Service MongoDB    # Windows
sudo systemctl status mongod  # Linux
```

### Error: Puerto en uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: Docker containers no inician
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Error: TPV no conecta al backend
1. Verificar que backend está ejecutándose
2. Verificar IP en ApiService
3. Verificar firewall

### Error: Flutter doctor muestra errores
```bash
flutter doctor --android-licenses
flutter doctor
```

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@dona-yoli.com | admin123 |
| Empleado | empleado@dona-yoli.com | empleado123 |
| Repartidor | repartidor@dona-yoli.com | repartidor123 |

---

## Comandos Rápidos

```bash
# Docker - Iniciar todo
docker-compose up -d

# Docker - Ver logs
docker-compose logs -f

# Docker - Detener
docker-compose down

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start

# TPV - Desarrollo
cd tpv && flutter run

# TPV - Build APK
cd tpv && flutter build apk --release

# Tests
cd backend && npm test:run
cd frontend && npm test
```

---

**Versión del Documento**: 2.0
**Fecha de Actualización**: Marzo 2026
**Proyecto**: Doña Yoli Ecommerce

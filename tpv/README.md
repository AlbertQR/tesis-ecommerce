# Doña Yoli TPV

Aplicación móvil Flutter para la gestión de pedidos en tienda y entregas a domicilio.

## Descripción

**Doña Yoli TPV** es una aplicación móvil diseñada para que los empleados y repartidores de Doña Yoli puedan:

- **Escanear códigos QR** de las facturas de los clientes
- **Verificar pedidos** al momento de la entrega o recogida
- **Actualizar el estado** del pedido a "entregado" automáticamente
- **Consultar pedidos pendientes** en tiempo real

## Flujo de Trabajo

1. El cliente realiza un pedido desde la tienda online
2. Se genera una factura PDF con código QR
3. Cuando el cliente recoge el pedido o el repartidor entrega:
   - El empleado/repartidor escanea el código QR
   - El sistema actualiza el estado a "entregado"
   - Se restaura el stock de productos

## Características

- 📱 Interfaz móvil intuitiva
- 📷 Escaneo de códigos QR con la cámara
- 🔐 Autenticación de empleados
- 📋 Lista de pedidos pendientes
- 🔄 Sincronización en tiempo real con el backend

## Tecnologías

- **Flutter 3.7+** - Framework principal
- **Dart** - Lenguaje de programación
- **Provider** - Gestión de estado
- **mobile_scanner** - Escaneo de códigos QR
- **http** - Comunicación con API
- **shared_preferences** - Almacenamiento local

## Estructura del Proyecto

```
lib/
├── main.dart              # Punto de entrada
├── services/
│   ├── api_service.dart   # Comunicación con API
│   └── auth_service.dart # Autenticación
└── screens/
    ├── login_screen.dart   # Login de empleados
    ├── home_screen.dart    # Menú principal
    ├── scanner_screen.dart # Escáner QR
    └── orders_screen.dart # Pedidos pendientes
```

## Instalación

### Prerequisites
- Flutter SDK 3.7+
- Android SDK / Xcode (para iOS)

###安装

```bash
# Instalar dependencias
cd tpv
flutter pub get

# Ejecutar en emulador
flutter run

# Construir APK
flutter build apk --release
```

## Configuración

### URL del Backend

El app está configurado para conectarse a `http://10.0.2.2:3000/api` (localhost de Android emulator).

Para cambiar la URL del backend, editar `lib/services/api_service.dart`:

```dart
static const String baseUrl = 'http://TU_IP:3000/api';
```

### Permisos Requeridos

- **Cámara** - Para escanear códigos QR
- **Internet** - Para comunicarse con el backend

## Uso

1. **Login**: El empleado inicia sesión con sus credenciales
2. **Menú Principal**: Muestra las opciones disponibles
3. **Escanear QR**: Apunta la cámara al código QR de la factura
4. **Verificación**: El sistema verifica y actualiza el estado

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/verify-qr` | Verificar pedido por QR |
| GET | `/api/admin/orders` | Obtener pedidos (admin/empleado) |

## Roles de Usuario

La app puede ser usada por:
- **Administradores**: Acceso completo
- **Empleados**: Escaneo de QR y gestión de pedidos
- **Repartidores**: Verificación de entregas

## Notas

- El código QR contiene: `{ "orderId": "xxx", "action": "verify" }`
- El backend debe estar ejecutándose para que la app funcione
- La app funciona tanto en Android como en iOS

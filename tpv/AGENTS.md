# TPV Agents - Doña Yoli (Terminal Punto de Venta)

## Stack Tecnológico

- **Framework**: Flutter 3.x
- **State Management**: Provider (`ChangeNotifierProvider`)
- **HTTP**: `package:http`
- **QR Scanning**: `mobile_scanner` v6.0.2
- **Local Storage**: `shared_preferences` (JWT persistence)
- **UI**: Material 3 con tema café (#8B4513)

## Arquitectura General

```
tpv/
├── lib/
│   ├── main.dart                 # Entry point + AuthWrapper
│   ├── screens/
│   │   ├── login_screen.dart    # Autenticación email/password
│   │   ├── home_screen.dart    # Dashboard con menú
│   │   ├── scanner_screen.dart # Escaneo QR + verificación
│   │   └── orders_screen.dart   # Lista pedidos pendientes
│   ├── services/
│   │   ├── api_service.dart     # HTTP client centralizado
│   │   └── auth_service.dart   # Estado auth (ChangeNotifier)
│   └── models/                   # Modelos de datos (dinámicos)
└── pubspec.yaml
```

## Flujo de la App

```
1. APP START
   │
   ├─→ AuthWrapper verifica token en SharedPreferences
   │      │
   │      ├─→ Token existe → HomeScreen (ya autenticado)
   │      │
   │      └─→ No token → LoginScreen
   │
   └─→ LOGIN (email + password)
         │
         ├─→ POST /api/auth/login
         │
         ├─→ Guardar token + user info en SharedPreferences
         │
         └─→ Navigate → HomeScreen
```

## Screens

### LoginScreen
- **Propósito**: Autenticación de empleados
- **Campos**: email, password
- **Validación**: email con `@`, password no vacío
- **Toggle**: visibilidad password
- **Error**: mensaje en rojo si falla
- **Navegación**: → HomeScreen tras login exitoso

### HomeScreen
- **Propósito**: Dashboard principal TPV
- **Muestra**: usuario logueado (nombre + rol)
- **Grid con 2 botones**:
  - **Escanear QR** → ScannerScreen
  - **Pedidos** → OrdersScreen
- **AppBar**: logout button
- **Rol badge**: admin/empleado

### ScannerScreen
- **Propósito**: Escanear QR de pedidos para entregar/cobrar
- **Tecnología**: `mobile_scanner` package
- **UI**: Overlay con cuadro centrado para scan
- **Botones**: linterna (torch), cambiar cámara
- **Workflow**:
  1. Escanea QR → parse JSON `{orderId: "..."}`
  2. GET `/api/orders/{orderId}` → obtener datos
  3. Mostrar diálogo con info (total, estado, método pago)
  4. Botones según estado:
     - **Efectivo + pending/ready** → "Confirmar Cobro y Entrega"
     - **Ya entregado** → "Ya Entregado" (disabled)
     - **Otro** → "Confirmar Entrega"
  5. PUT `/api/admin/orders/:id/payment` para confirmar
  6. PUT `/api/admin/orders/:id/status` para marcar entregado

### OrdersScreen
- **Propósito**: Ver lista de pedidos pendientes
- **Data**: GET `/api/admin/orders` (filtrado en cliente)
- **Filtros**: pending, confirmed, preparing, ready
- **UI**: Pull-to-refresh, cards por pedido
- **Card info**: ID, total, status badge, delivery/recojo
- **Navegación**: ← Home

## API Service

```dart
class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Auth
  static Future<Map<String, dynamic>> login(String email, String password);
  
  // Orders
  static Future<Map<String, dynamic>?> getOrderById(String orderId);
  static Future<List<dynamic>> getPendingOrders();
  static Future<bool> updateOrderStatus(String orderId, String status);
  static Future<bool> confirmPayment(String orderId);
  
  // QR
  static Future<Map<String, dynamic>> verifyQrCode(
    String orderId, {
    bool confirmPayment = false,
  });
  
  // Token management
  static void setToken(String token);
  static void clearToken();
}
```

**Headers por defecto**:
```dart
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}'  // excepto login
}
```

## Auth Service (ChangeNotifier)

```dart
class AuthService extends ChangeNotifier {
  bool isLoading = false;
  bool isAuthenticated = false;
  String? token;
  String? userName;
  String? userRole;
  
  Future<bool> login(String email, String password);
  Future<void> logout();
  Future<void> checkAuth();  // Verifica token en SharedPreferences
}
```

## Auth Flow

```
1. Login → POST /api/auth/login
   └─→ Response: { token, user: { name, role, ... } }
   
2. Decodificar JWT manualmente (sin librería)
   └─→ Extraer 'name' y 'role' del payload base64
   
3. Persistir en SharedPreferences:
   - 'auth_token': JWT string
   - 'user_name': nombre
   - 'user_role': rol
   
4. En cada API call → ApiService.setToken(token)
   
5. Logout → clearToken() + SharedPreferences.removeAll
```

**Nota**: JWT decode es manual sin validación de firma (simplificado).

## Modelos de Datos

**Sin modelos tipados** - Todo usa `Map<String, dynamic>`:

### Order (del backend)
```dart
{
  "id": "67d9f...",                    // MongoDB ObjectId
  "orderId": "ORD-1774812369221",    // ID legible
  "items": [
    {
      "productId": "...",
      "productName": "Pizza Pepperoni",
      "productImage": "...",
      "quantity": 2,
      "unitPrice": 15000,
    }
  ],
  "subtotal": 30000,
  "shipping": 100,
  "total": 30100,
  "status": "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled",
  "paymentMethod": "cash" | "enzona",
  "paymentStatus": "pending" | "paid" | "refunded",
  "deliveryAddress": {
    "label": "Casa",
    "street": "Calle 123",
    ...
  },
  "hasDelivery": true | false,
  "createdAt": "2025-01-15T10:30:00.000Z",
}
```

### QR Code (generado en frontend web)
```json
{"orderId": "ORD-1774812369221"}
```

## Estados de Pedido

| Estado | Descripción | Color UI |
|--------|-------------|----------|
| `pending` | Esperando confirmación | Naranja |
| `confirmed` | Confirmado, en cola | Azul |
| `preparing` | En preparación | Amarillo |
| `ready` | Listo para entregar | Verde |
| `delivered` | Entregado | Gris |
| `cancelled` | Cancelado | Rojo |

## QR Scanning - Cómo Funciona

```
1. FRONTEND WEB genera QR con: {"orderId": "ORD-..."}
   └─→ Generalmente en la página de confirmación de pedido

2. TPV SCANNER captura el código
   └─→ MobileScannerwidget

3. Parse JSON:
   dart
   final data = jsonDecode(code.rawValue);
   final orderId = data['orderId'];

4. Fetch order data:
   GET /api/orders/{orderId}

5. Mostrar diálogo con:
   - Total del pedido
   - Estado actual
   - Método de pago
   - Lista de items

6. Lógica de confirmación:
   ├─→ Si cash + pending + puede entregar
   │   └─→ PUT /admin/orders/:id/payment (confirmar pago)
   │
   ├─→ Si ready para delivery
   │   └─→ PUT /admin/orders/:id/status = 'delivered'
   │
   └─→ Ya entregado → Solo mostrar info (disabled)
```

## Endpoints del Backend Usados

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/api/auth/login` | Login TPV |
| GET | `/api/orders/:id` | Detalle pedido por QR |
| GET | `/api/admin/orders` | Lista pedidos pendientes |
| PUT | `/api/admin/orders/:id/status` | Cambiar estado (delivered) |
| PUT | `/api/admin/orders/:id/payment` | Confirmar pago cash |

## Estados de la App

```dart
// ScannerScreen
bool _hasScanned = false;    // Previene double scan
bool _isProcessing = false;  // Esperando respuesta

// AuthService
bool isLoading = false;      // Verificando auth
bool isAuthenticated = false; // Logueado
```

## Configuración

```dart
// ApiService
static const String baseUrl = 'http://localhost:3000/api';

// Theme
Color primaryColor = Color(0xFF8B4513);  // Café/Marrón

// JWT expiry: 7 días (definido en backend)
```

## Dependencias (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  mobile_scanner: ^6.0.2       # QR scanning
  provider: ^6.1.2            # State management
  shared_preferences: ^2.3.4   # Local storage
  http: ^1.2.2                # HTTP client

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
```

## Notas y Mejoras Pendientes

### Issues Observados
1. **No hay modelos tipados** - Todo es `Map<String, dynamic>`
2. **Base URL hardcodeada** - Debería usar environment variable
3. **JWT decode manual** - Sin validación de firma cryptográfica
4. **No hay manejo de errores de red** - Timeout, offline, etc.
5. **OrdersScreen filtra en cliente** - Podría filtrarse en backend
6. **No hay loading states intermedios** en scanner

### Mejoras Sugeridas
- Agregar modelos tipados con `freezed` o `json_serializable`
- Usar `flutter_secure_storage` para token
- Validar JWT con `jwt_decoder`
- Agregar retry logic para requests fallidos
- Server-side filtering para pedidos

## Convenciones de Código

1. **State Management**: Provider con ChangeNotifier
2. **API Calls**: Métodos estáticos en ApiService
3. **No null safety estricta**: Muchos `dynamic`
4. **Material 3**: Widgets con `useMaterial3: true`
5. **Colors**: Primary café (#8B4513)

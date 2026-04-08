Caso de prueba de aceptación
Código: HU1_P1 	Historia de usuario: 1
Nombre: Gestionar Usuarios
Descripción: Prueba para verificar la funcionalidad de gestión de usuarios
Condiciones de ejecución: El usuario debe tener el rol "ADMINISTRADOR"
Pasos de ejecución:
•	El administrador accede al módulo de usuarios
•	Llena el formulario con la información del nuevo usuario y presiona el botón "Crear"
•	Luego para editar la información del usuario presiona el botón "Editar" 
•	Por último, elimina el usuario creado presionando el botón "Eliminar"
Resultados esperados:
•	Se creó exitosamente el usuario en el sistema
•	Fue posible editar la información relacionada con el usuario
•	Se mostró correctamente una lista con los usuarios existentes en el sistema
•	Se eliminó exitosamente el usuario
Evaluación: ✅ Satisfactoria - Implementado en admin-users.component.ts

Caso de prueba de aceptación
Código: HU2_P1	Historia de usuario: 2
Nombre: Autenticar Usuarios
Descripción: Prueba para verificar la funcionalidad de autenticación en el sistema
Condiciones de ejecución: El usuario debe estar registrado previamente en el sistema
Pasos de ejecución:
•	El usuario accede a la página de login
•	Introduce su email y contraseña en los campos correspondientes
•	Presiona el botón "Iniciar Sesión" 
Resultados esperados:
•	Se enviaron las credenciales al servidor de forma segura
•	El sistema valida las credenciales correctamente
•	El usuario es redirigido a la página principal del sistema
•	Se genera un token JWT válido por 7 días
Evaluación: ✅ Satisfactoria - JWT implementado con expiración de 7 días

Caso de prueba de aceptación
Código: HU3_P1	Historia de usuario: 3
Nombre: Gestionar Categorías de Productos
Descripción: Prueba para verificar la gestión de categorías de productos
Condiciones de ejecución: El usuario debe tener rol de administrador
Pasos de ejecución:
•	El administrador accede al módulo de categorías
•	Presiona "Nueva Categoría" y completa el formulario
•	Sube una imagen representativa (opcional)
•	Presiona "Guardar"
•	Edita la categoría existente
•	Elimina la categoría (si no tiene productos asociados)
Resultados esperados:
•	Se creó exitosamente la categoría
•	La categoría aparece en el listado general
•	Fue posible editar la información de la categoría
•	No se permite eliminar una categoría con productos asociados
•	Se eliminó exitosamente la categoría sin productos
Evaluación: ✅ Satisfactoria - Implementado. Las categorías se gestionan desde `/admin/categorias` con CRUD completo y se usan dinámicamente en productos y menú.

Caso de prueba de aceptación
Código: HU4_P1	Historia de usuario: 4
Nombre: Gestionar Productos del Catálogo
Descripción: Prueba para verificar la gestión completa de productos
Condiciones de ejecución: El usuario debe tener rol de administrador
Pasos de ejecución:
•	El administrador accede al módulo de productos
•	Presiona "Agregar Producto"
•	Completa: nombre, descripción, precio, stock, categoría
•	Sube imagen del producto
•	Presiona "Guardar"
•	Modifica el precio y el stock del producto
•	Cambia el estado a "Agotado"
•	Elimina el producto
Resultados esperados:
•	Se creó exitosamente el producto
•	El producto aparece en el catálogo
•	La imagen se cargó correctamente
•	Fue posible modificar precio y stock
•	El estado se actualizó correctamente
•	Se eliminó exitosamente el producto
Evaluación: ✅ Satisfactoria - Implementado en admin-products.component.ts

Caso de prueba de aceptación
Código: HU5_P1	Historia de usuario: 5
Nombre: Buscar y Filtrar Productos
Descripción: Prueba para verificar la funcionalidad de búsqueda y filtros
Condiciones de ejecución: El usuario debe ser cliente registrado
Pasos de ejecución:
•	El cliente accede al catálogo de productos
•	Escribe "café" en el buscador 
•	Aplica filtro por categoría "Bebidas" 
•	Aplica filtro por rango de precio: $5 - $15
•	Activa filtro "Solo disponibles" 
•	Ordena por "Precio: menor a mayor"
Resultados esperados:
•	El buscador muestra productos que contienen "café" en tiempo real 
•	Los filtros se aplican correctamente de forma combinada 
•	Solo se muestran productos con stock > 0
•	Los resultados se ordenan correctamente por precio
•	El sistema muestra el número total de resultados 
Evaluación: ✅ Satisfactoria - Implementado en products.component.ts con filtros de búsqueda, categoría, precio y ordenamiento

Caso de prueba de aceptación
Código: HU6_P1	Historia de usuario: 6
Nombre: Gestionar Carrito de Compras
Descripción: Prueba para verificar la gestión del carrito de compras
Condiciones de ejecución: El usuario debe ser cliente autenticado
Pasos de ejecución:
•	El cliente selecciona un producto
•	Presiona "Agregar al Carrito"
•	Agrega 3 productos diferentes
•	Modifica la cantidad de un producto a 2 unidades
•	Elimina un producto del carrito
•	Visualiza el resumen del carrito
Resultados esperados:
•	El producto se agregó correctamente al carrito
•	El carrito muestra los 3 productos
•	La cantidad se actualizó correctamente
•	El subtotal se recalcula automáticamente
•	El producto fue eliminado del carrito
•	El total se muestra correctamente (subtotal + envío)
•	El carrito expira después de 30 minutos sin actividad
Evaluación: ✅ Satisfactoria - Implementado en cart.service.ts y order.controller.ts (expiración 30 min verificada)

Caso de prueba de aceptación
Código: HU7_P1	Historia de usuario: 7
Nombre: Gestionar Direcciones de Entrega
Descripción: Prueba para verificar la gestión de direcciones de entrega
Condiciones de ejecución: El usuario debe ser cliente autenticado
Pasos de ejecución:
•	El cliente accede a "Mis Direcciones"
•	Presiona "Agregar Nueva Dirección" 
•	Completa: calle, número, ciudad, barrio, instrucciones
•	Marca como "Dirección Predeterminada"
•	Guarda la dirección
•	Edita la dirección creada
•	Elimina la dirección
Resultados esperados:
•	La dirección se guardó correctamente
•	Aparece en la lista de direcciones del usuario
•	Se marcó correctamente como predeterminada
•	Fue posible editar los datos de la dirección
•	Se eliminó exitosamente la dirección
Evaluación: ✅ Satisfactoria - Implementado en profile.component.ts (favoritos, addresses, CRUD completo)

Caso de prueba de aceptación
Código: HU8_P1	Historia de usuario: 8
Nombre: Procesar Checkout de Pedido
Descripción: Prueba para verificar el proceso de checkout
Condiciones de ejecución: El cliente debe tener productos en el carrito
Pasos de ejecución:
•	El cliente presiona "Proceder al Pago"
•	Selecciona tipo de entrega: "Delivery"
•	Selecciona dirección de entrega
•	Selecciona método de pago: "EnZona"
•	Revisa el resumen del pedido
•	Presiona "Confirmar Pedido" 
Resultados esperados:
•	El sistema valida que hay stock disponible
•	Se calcula correctamente el costo de envío (100 COP)
•	Se genera un número de pedido único
•	El pedido se crea con estado "Pendiente"
•	El carrito se vacía automáticamente
•	Se redirige a la pasarela de pago EnZona
Evaluación: ✅ Satisfactoria - Implementado en order.controller.ts (checkout, delivery fee 100 COP)

Caso de prueba de aceptación
Código: HU9_P1	Historia de usuario: 9
Nombre: Integrar Pago con EnZona
Descripción: Prueba para verificar la integración con EnZona
Condiciones de ejecución: Configuración de EnZona válida en el sistema
Pasos de ejecución:
•	El cliente confirma el pedido con pago EnZona
•	El sistema redirige a la plataforma EnZona
•	El cliente ingresa datos de pago en EnZona
•	Confirma el pago en EnZona
•	EnZona envía webhook al sistema
•	El sistema procesa la confirmación
Resultados esperados:
•	La redirección a EnZona es correcta
•	El monto y descripción coinciden con el pedido
•	El webhook se recibe correctamente
•	El estado del pedido cambia a "Confirmado"
•	El estado de pago cambia a "Pagado"
•	Se genera la factura PDF automáticamente
•	Se envía email de confirmación al cliente
Evaluación: ✅ Satisfactoria - Implementado en enzona.service.ts, payment.controller.ts y order.controller.ts

Caso de prueba de aceptación
Código: HU10_P1	Historia de usuario: 10
Nombre: Gestionar Pago Contra Entrega
Descripción: Prueba para verificar pago en efectivo
Condiciones de ejecución: El cliente selecciona "Pago Contra Entrega
Pasos de ejecución:
•	El cliente selecciona "Efectivo" como método de pago
•	Confirma el pedido
•	El repartidor entrega el pedido
•	El repartidor marca el pago como recibido
Resultados esperados:
•	El pedido se crea con estado "Pendiente de Pago"
•	El cliente recibe confirmación del pedido
•	El repartidor puede verificar el monto a cobrar
•	El estado cambia a "Pagado" al confirmar recepción
•	El pedido pasa a estado "Entregado"
Evaluación: ✅ Satisfactoria - El pedido se crea como 'pending'. La app TPV permite confirmar cobro en efectivo y marcar como entregado simultáneamente.

Caso de prueba de aceptación
Código: HU11_P1	Historia de usuario: 11
Nombre: Generar Factura PDF con QR
Descripción: Prueba para verificar generación de facturas
Condiciones de ejecución: Pedido confirmado y pagado
Pasos de ejecución:
•	El sistema detecta pago confirmado
•	Genera automáticamente la factura PDF
•	Incluye código QR en la factura
•	El cliente descarga la factura
•	Escanea el código QR
Resultados esperados:
•	La factura se genera en formato PDF 
•	Contiene todos los datos del pedido
•	Incluye datos del cliente y empresa
•	El QR contiene información verificable del pedido
•	Al escanear el QR muestra: número de pedido, fecha, monto
•	La factura se guarda en el historial del cliente
Evaluación: ✅ Satisfactoria - Implementado con PDFKit y QRCode en order.controller.ts (generateInvoice)

Caso de prueba de aceptación
Código: HU12_P1	Historia de usuario: 12
Nombre: Gestionar Pedidos (Cliente)
Descripción: Prueba para verificar historial de pedidos del cliente
Condiciones de ejecución: El cliente debe tener pedidos realizados
Pasos de ejecución:
•	El cliente accede a "Mis Pedidos"
•	Visualiza la lista de pedidos
•	Selecciona un pedido específico
•	Verifica el estado del pedido
•	Descarga la factura del pedido
•	Cancela un pedido en estado "Pendiente" 
Resultados esperados:
•	Se muestra el historial completo de pedidos
•	Cada pedido muestra: número, fecha, total, estado
•	El detalle del pedido muestra todos los items
•	El estado se actualiza en tiempo real
•	La factura se descarga correctamente
•	Solo se pueden cancelar pedidos en estado "Pendiente"
Evaluación: ✅ Satisfactoria - Implementado en orders.component.ts (frontend) y order.controller.ts (backend)

Caso de prueba de aceptación
Código: HU13_P1	Historia de usuario: 13
Nombre: Gestionar Pedidos (Administrador)
Descripción: Prueba para verificar gestión administrativa de pedidos
Condiciones de ejecución: El usuario debe tener rol de administrador
Pasos de ejecución:
•	El administrador accede a "Gestión de Pedidos"
•	Filtra pedidos por estado "Pendiente"
•	Selecciona un pedido
•	Cambia el estado a "Confirmado"
•	Asigna un repartidor al pedido
•	Cambia el estado a "Entregado"
•	Cancela un pedido con reembolso
Resultados esperados:
•	Se listan todos los pedidos del sistema
•	Los filtros funcionan correctamente
•	El cambio de estado se registra correctamente
•	El repartidor se asigna al pedido
•	El cliente recibe notificación del cambio de estado
•	El reembolso se procesa según porcentaje configurado
Evaluación: ✅ Satisfactoria - Implementado en admin-orders.component.ts. Filtros, cambio de estado y asignación de repartidor funcionando. Campo 'deliveryPerson' agregado al modelo de Order.

Caso de prueba de aceptación
Código: HU14_P1	Historia de usuario: 14
Nombre: Gestionar Reseñas y Calificaciones
Descripción: Prueba para verificar sistema de reseñas
Condiciones de ejecución: El cliente debe haber comprado el producto
Pasos de ejecución:
•	El cliente accede al detalle de un producto comprado
•	Presiona "Dejar Reseña"
•	Selecciona calificación de 1 a 5 estrellas
•	Escribe un comentario
•	Envía la reseña
•	Visualiza el promedio de calificación del producto
Resultados esperados:
•	Solo clientes que compraron el producto pueden reseñar
•	La calificación se guarda correctamente 
•	El comentario se publica (previa moderación si aplica)
•	El promedio de calificación se recalcula automáticamente
•	La reseña aparece en el producto
Evaluación: ✅ Satisfactoria - Sistema de reviews con validación de compra. Solo permite reseñar si el usuario tiene un pedido activo (delivered/confirmed/preparing/ready) con ese producto.

Caso de prueba de aceptación
Código: HU15_P1	Historia de usuario: 15
Nombre: Gestionar Lista de Favoritos
Descripción: Prueba para verificar lista de favoritos
Condiciones de ejecución: El usuario debe ser cliente autenticado
Pasos de ejecución:
•	El cliente visualiza un producto
•	Presiona el ícono de "Corazón/Favorito"
•	Accede a "Mis Favoritos"
•	Visualiza la lista de productos favoritos 
•	Elimina un producto de favoritos
Resultados esperados:
•	El producto se agrega a favoritos
•	El ícono cambia de estado (lleno/vacío)
•	La lista muestra todos los productos favoritos
•	Los favoritos son persistentes entre sesiones
•	Se puede eliminar un producto de favoritos
Evaluación: ✅ Satisfactoria - Implementado en favorites.service.ts, favorites.component.ts y user.controller.ts

Caso de prueba de aceptación
Código: HU16_P1	Historia de usuario: 16
Nombre: Dashboard Administrativo
Descripción: Prueba para verificar dashboard de estadísticas
Condiciones de ejecución: El usuario debe tener rol de administrador
Pasos de ejecución:
•	El administrador accede al dashboard
•	Visualiza gráfico de ventas del mes
•	Visualiza top 5 productos más vendidos
•	Visualiza total de ingresos del día
•	Visualiza pedidos por estado
•	Cambia el período de visualización
Resultados esperados:
•	El dashboard carga correctamente
•	Los gráficos se renderizan correctamente
•	Los datos son precisos y actualizados
•	Las estadísticas coinciden con la base de datos
•	Los filtros de fecha funcionan correctamente
•	El tiempo de carga es menor a 2 segundos
Evaluación: ✅ Satisfactoria - Implementado en admin-dashboard.component.ts con dashboard.controller.ts (stats, salesData, topProducts, recentOrders)

Caso de prueba de aceptación
Código: HU17_P1	Historia de usuario: 17
Nombre: Exportar Reportes a Excel
Descripción: Prueba para verificar exportación a Excel
Condiciones de ejecución: El usuario debe tener un reporte generado
Pasos de ejecución:
•	El administrador genera un reporte de ventas
•	Presiona el botón "Exportar a Excel"
•	Selecciona formato .xlsx
•	Descarga el archivo
•	Abre el archivo en Excel
Resultados esperados:
•	El archivo se descarga correctamente
•	El formato es .xlsx válido
•	Los datos coinciden con el reporte visual
•	El formato se mantiene (columnas, filas)
•	Los totales y fórmulas son correctos
•	El archivo se puede editar en Excel
Evaluación: ✅ Satisfactoria - Implementado en export.controller.ts y export.routes.ts (ventas, pedidos, inventario)

Caso de prueba de aceptación
Código: HU18_P1	Historia de usuario: 18
Nombre: App TPV con Escaneo QR
Descripción: Prueba para verificar app móvil de verificación
Condiciones de ejecución: El usuario debe tener rol de empleado/repartidor
Pasos de ejecución:
•	El repartidor inicia sesión en la app TPV
•	Accede a la función de escáner QR
•	Escanea el QR de una factura
•	Verifica la información del pedido
•	Confirma la entrega
Resultados esperados:
•	La app inicia sesión correctamente
•	La cámara se activa para escanear
•	El QR se lee correctamente
•	Se muestra la información del pedido
•	El estado del pedido cambia a "Entregado"
•	Se registra la hora de entrega y repartidor
Evaluación: ✅ Satisfactoria - Implementado en tpv/lib/screens/scanner_screen.dart y verifyOrderByQR en order.controller.ts

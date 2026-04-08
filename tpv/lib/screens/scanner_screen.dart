import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  MobileScannerController? _controller;
  bool _isProcessing = false;
  bool _hasScanned = false;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _processQRCode(String code) async {
    if (_isProcessing || _hasScanned) return;

    setState(() {
      _isProcessing = true;
      _hasScanned = true;
    });

    try {
      final data = jsonDecode(code) as Map<String, dynamic>;
      final orderId = data['orderId'] as String?;

      if (orderId == null) {
        _showError('Código QR inválido');
        return;
      }

      final apiService = context.read<ApiService>();

      // Primero obtener los datos del pedido para mostrar info
      final orderData = await apiService.getOrderById(orderId);

      if (mounted) {
        _showOrderConfirmation(orderId, orderData);
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  void _showOrderConfirmation(String orderId, Map<String, dynamic> orderData) {
    final paymentMethod = orderData['paymentMethod'] as String? ?? 'cash';
    final paymentStatus = orderData['paymentStatus'] as String? ?? 'pending';
    final total = orderData['total'] as num? ?? 0;
    final status = orderData['status'] as String? ?? '';

    final isCashPayment = paymentMethod == 'cash';
    final canConfirmPayment =
        isCashPayment &&
        paymentStatus == 'pending' &&
        ['confirmed', 'preparing', 'ready'].contains(status);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder:
          (context) => AlertDialog(
            title: Row(
              children: [
                const Icon(Icons.qr_code, color: Color(0xFF8B4513)),
                const SizedBox(width: 8),
                const Text('Pedido Encontrado'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Orden: ${orderData['orderId'] ?? orderId}'),
                const SizedBox(height: 4),
                Text('Estado: ${_getStatusLabel(status)}'),
                const SizedBox(height: 4),
                Text('Total: \$${total.toStringAsFixed(0)} COP'),
                const SizedBox(height: 4),
                Text(
                  'Pago: ${paymentMethod == 'cash' ? 'Efectivo' : 'EnZona'}',
                ),
                if (isCashPayment) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Estado pago: ${paymentStatus == 'paid' ? 'Confirmado' : 'Pendiente'}',
                    style: TextStyle(
                      color:
                          paymentStatus == 'paid'
                              ? Colors.green
                              : Colors.orange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _resetScanner();
                },
                child: const Text('Cancelar'),
              ),
              if (canConfirmPayment)
                FilledButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    await _confirmPaymentAndDelivery(orderId);
                  },
                  style: FilledButton.styleFrom(backgroundColor: Colors.green),
                  child: const Text('Confirmar Cobro y Entrega'),
                )
              else if (status == 'delivered')
                FilledButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pop(context);
                  },
                  style: FilledButton.styleFrom(backgroundColor: Colors.grey),
                  child: const Text('Ya Entregado'),
                )
              else
                FilledButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    await _confirmDelivery(orderId);
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF8B4513),
                  ),
                  child: const Text('Confirmar Entrega'),
                ),
            ],
          ),
    );
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'preparing':
        return 'En preparación';
      case 'ready':
        return 'Listo';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  Future<void> _confirmPaymentAndDelivery(String orderId) async {
    setState(() {
      _isProcessing = true;
    });

    try {
      final apiService = context.read<ApiService>();
      final result = await apiService.verifyQrCode(
        orderId,
        confirmPayment: true,
      );

      if (mounted) {
        _showSuccess('Pago confirmado y pedido entregado', result);
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  Future<void> _confirmDelivery(String orderId) async {
    setState(() {
      _isProcessing = true;
    });

    try {
      final apiService = context.read<ApiService>();
      final result = await apiService.verifyQrCode(orderId);

      if (mounted) {
        _showSuccess('Pedido marcado como entregado', result);
      }
    } catch (e) {
      if (mounted) {
        _showError(e.toString().replaceAll('Exception: ', ''));
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
    _resetScanner();
  }

  void _showSuccess(String message, Map<String, dynamic> result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder:
          (context) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 32),
                SizedBox(width: 8),
                Text('Éxito'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(message),
                const SizedBox(height: 8),
                if (result['order'] != null)
                  Text(
                    'Estado: ${result['order']['status']}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _resetScanner();
                },
                child: const Text('Escanear otro'),
              ),
              FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF8B4513),
                ),
                child: const Text('Volver'),
              ),
            ],
          ),
    );
  }

  void _resetScanner() {
    setState(() {
      _isProcessing = false;
      _hasScanned = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escanear QR'),
        backgroundColor: const Color(0xFF8B4513),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(
              _controller?.torchEnabled ?? false
                  ? Icons.flash_on
                  : Icons.flash_off,
            ),
            onPressed: () => _controller?.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_android),
            onPressed: () => _controller?.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
                _processQRCode(barcodes.first.rawValue!);
              }
            },
          ),
          CustomPaint(
            painter: ScannerOverlayPainter(),
            child: const SizedBox.expand(),
          ),
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),
          Positioned(
            bottom: 32,
            left: 16,
            right: 16,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.qr_code_scanner,
                      size: 32,
                      color: Color(0xFF8B4513),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isProcessing
                          ? 'Verificando pedido...'
                          : 'Apunta la cámara al código QR de la factura',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..color = Colors.black54
          ..style = PaintingStyle.fill;

    final scanAreaSize = size.width * 0.7;
    final left = (size.width - scanAreaSize) / 2;
    final top = (size.height - scanAreaSize) / 2 - 50;

    final scanRect = Rect.fromLTWH(left, top, scanAreaSize, scanAreaSize);

    final path =
        Path()
          ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
          ..addRRect(
            RRect.fromRectAndRadius(scanRect, const Radius.circular(16)),
          )
          ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, paint);

    final borderPaint =
        Paint()
          ..color = const Color(0xFF8B4513)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3;

    canvas.drawRRect(
      RRect.fromRectAndRadius(scanRect, const Radius.circular(16)),
      borderPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Para desarrollo, usa localhost. Para producción, cambia a la IP del servidor
  static const String baseUrl = 'http://localhost:3000/api';

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  void clearToken() {
    _token = null;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['token'];
      return data;
    } else {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Error al iniciar sesión');
    }
  }

  Future<Map<String, dynamic>> verifyQrCode(
    String orderId, {
    bool confirmPayment = false,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/verify-qr'),
      headers: _headers,
      body: jsonEncode({'orderId': orderId, 'confirmPayment': confirmPayment}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 404) {
      throw Exception('Pedido no encontrado');
    } else {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Error al verificar el pedido');
    }
  }

  Future<Map<String, dynamic>> getOrderById(String orderId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/$orderId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 404) {
      throw Exception('Pedido no encontrado');
    } else {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Error al obtener el pedido');
    }
  }

  Future<List<dynamic>> getPendingOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/orders'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data
          .where(
            (order) =>
                order['status'] == 'pending' ||
                order['status'] == 'confirmed' ||
                order['status'] == 'preparing' ||
                order['status'] == 'ready',
          )
          .toList();
    } else {
      throw Exception('Error al obtener pedidos');
    }
  }
}

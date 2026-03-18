import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final ApiService _apiService;
  bool _isLoading = true;
  bool _isAuthenticated = false;
  String? _userName;
  String? _userRole;
  String? _token;

  AuthService(this._apiService) {
    checkAuth();
  }

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get userName => _userName;
  String? get userRole => _userRole;
  String? get token => _token;

  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');
      _userName = prefs.getString('userName');
      _userRole = prefs.getString('userRole');
      
      if (_token != null) {
        _apiService.setToken(_token!);
        _isAuthenticated = true;
      }
    } catch (e) {
      _isAuthenticated = false;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _apiService.login(email, password);
      _token = data['token'];
      
      // Decode JWT to get user info (simple approach)
      final parts = _token!.split('.');
      if (parts.length == 3) {
        final payload = _decodeJwt(parts[1]);
        _userName = payload['name'] ?? 'Usuario';
        _userRole = payload['role'] ?? 'user';
      }

      // Save to preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      await prefs.setString('userName', _userName!);
      await prefs.setString('userRole', _userRole!);

      _apiService.setToken(_token!);
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    _apiService.clearToken();
    _token = null;
    _userName = null;
    _userRole = null;
    _isAuthenticated = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userName');
    await prefs.remove('userRole');

    _isLoading = false;
    notifyListeners();
  }

  Map<String, dynamic> _decodeJwt(String payload) {
    try {
      final output = payload.replaceAll('-', '+').replaceAll('_', '/');
      final padLength = (4 - output.length % 4) % 4;
      final padded = output + ('=' * padLength);
      final decoded = utf8.decode(base64.decode(padded));
      return Map<String, dynamic>.from(jsonDecode(decoded));
    } catch (e) {
      return {};
    }
  }
}

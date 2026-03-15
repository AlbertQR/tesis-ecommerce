import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User, AuthResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    phone: '+573001234567',
    role: 'user'
  };

  const mockAdminUser: User = {
    id: '2',
    email: 'admin@test.com',
    name: 'Admin User',
    phone: '+573001234567',
    role: 'admin'
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: 'mock-jwt-token'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should not be authenticated initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should not be admin initially', () => {
      expect(service.isAdmin()).toBe(false);
    });

    it('should have null user initially', () => {
      expect(service.user()).toBeNull();
    });

    it('should have null token initially', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('login', () => {
    it('should call login endpoint with correct credentials', () => {
      service.login('test@test.com', 'password123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@test.com',
        password: 'password123'
      });
    });

    it('should set token and user on successful login', () => {
      service.login('test@test.com', 'password123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush(mockAuthResponse);

      expect(service.getToken()).toBe('mock-jwt-token');
      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should save token to localStorage on login', () => {
      service.login('test@test.com', 'password123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user')).toBeTruthy();
    });

    it('should set isAdmin to false for regular user', () => {
      service.login('test@test.com', 'password123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush(mockAuthResponse);

      expect(service.isAdmin()).toBe(false);
    });

    it('should set isAdmin to true for admin user', () => {
      const adminResponse: AuthResponse = {
        user: mockAdminUser,
        token: 'admin-token'
      };

      service.login('admin@test.com', 'admin123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush(adminResponse);

      expect(service.isAdmin()).toBe(true);
    });
  });

  describe('register', () => {
    it('should call register endpoint with correct data', () => {
      service.register('New User', 'new@test.com', '+573001234567', 'password123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'New User',
        email: 'new@test.com',
        phone: '+573001234567',
        password: 'password123'
      });
    });

    it('should set token and user on successful registration', () => {
      service.register('New User', 'new@test.com', '+573001234567', 'password123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      req.flush(mockAuthResponse);

      expect(service.getToken()).toBe('mock-jwt-token');
      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service.login('test@test.com', 'password123').subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      req.flush(mockAuthResponse);
    });

    it('should clear token on logout', () => {
      service.logout();
      expect(service.getToken()).toBeNull();
    });

    it('should clear user on logout', () => {
      service.logout();
      expect(service.user()).toBeNull();
    });

    it('should set isAuthenticated to false on logout', () => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should remove token from localStorage on logout', () => {
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should remove user from localStorage on logout', () => {
      service.logout();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('should call /me endpoint', () => {
      service.refreshUser().subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/me');
      expect(req.request.method).toBe('GET');
    });

    it('should update user data on refresh', () => {
      service.refreshUser().subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/me');
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
    });

    it('should update localStorage on refresh', () => {
      service.refreshUser().subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/auth/me');
      req.flush(mockUser);

      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });

  describe('loadFromStorage', () => {
    it('should load token from localStorage on init', () => {
      localStorage.setItem('token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const newService = TestBed.inject(AuthService);
      
      expect(newService.getToken()).toBe('stored-token');
    });

    it('should load user from localStorage on init', () => {
      localStorage.setItem('token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const newService = TestBed.inject(AuthService);
      
      expect(newService.user()?.email).toBe('test@test.com');
    });

    it('should not load if no token in localStorage', () => {
      const newService = TestBed.inject(AuthService);
      
      expect(newService.isAuthenticated()).toBe(false);
    });
  });
});

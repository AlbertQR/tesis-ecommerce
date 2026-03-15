import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, Address, Order, OrderStatus } from './user.service';
import { AuthService } from './auth.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockAddress: Address = {
    id: '1',
    userId: 'user1',
    label: 'Casa',
    street: 'Calle 123',
    number: '45',
    city: 'Bogotá',
    neighborhood: 'Centro',
    isDefault: true
  };

  const mockOrder: Order = {
    id: '1',
    userId: 'user1',
    date: new Date(),
    status: 'pending',
    items: [],
    subtotal: 50000,
    shipping: 100,
    total: 50100,
    deliveryAddress: mockAddress
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user1', email: 'test@test.com', role: 'user' }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, AuthService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne('http://localhost:3000/api/auth/me');
    req.flush({ id: 'user1', email: 'test@test.com', role: 'user' });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStatusLabel', () => {
    it('should return correct label for pending status', () => {
      expect(service.getStatusLabel('pending')).toBe('Pendiente');
    });

    it('should return correct label for confirmed status', () => {
      expect(service.getStatusLabel('confirmed')).toBe('Confirmado');
    });

    it('should return correct label for preparing status', () => {
      expect(service.getStatusLabel('preparing')).toBe('Preparando');
    });

    it('should return correct label for ready status', () => {
      expect(service.getStatusLabel('ready')).toBe('Listo para entregar');
    });

    it('should return correct label for delivered status', () => {
      expect(service.getStatusLabel('delivered')).toBe('Entregado');
    });

    it('should return correct label for cancelled status', () => {
      expect(service.getStatusLabel('cancelled')).toBe('Cancelado');
    });
  });

  describe('getStatusClass', () => {
    it('should return correct CSS class for pending status', () => {
      expect(service.getStatusClass('pending')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return correct CSS class for confirmed status', () => {
      expect(service.getStatusClass('confirmed')).toBe('bg-blue-100 text-blue-800');
    });

    it('should return correct CSS class for preparing status', () => {
      expect(service.getStatusClass('preparing')).toBe('bg-orange-100 text-orange-800');
    });

    it('should return correct CSS class for ready status', () => {
      expect(service.getStatusClass('ready')).toBe('bg-green-100 text-green-800');
    });

    it('should return correct CSS class for delivered status', () => {
      expect(service.getStatusClass('delivered')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return correct CSS class for cancelled status', () => {
      expect(service.getStatusClass('cancelled')).toBe('bg-red-100 text-red-800');
    });
  });

  describe('addresses', () => {
    it('should load addresses from API', () => {
      const addressesReq = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      addressesReq.flush([mockAddress]);

      expect(service.addresses()).toHaveLength(1);
      expect(service.addresses()[0].label).toBe('Casa');
    });

    it('should add new address', () => {
      const addressesReq = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      addressesReq.flush([]);

      const newAddress: Address = {
        id: '2',
        userId: 'user1',
        label: 'Oficina',
        street: 'Carrera 10',
        number: '20',
        city: 'Bogotá',
        neighborhood: 'Chapinero',
        isDefault: false
      };

      service.addAddress({
        userId: 'user1',
        label: 'Oficina',
        street: 'Carrera 10',
        number: '20',
        city: 'Bogotá',
        neighborhood: 'Chapinero',
        isDefault: false
      });

      const req = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      req.flush(newAddress);

      expect(service.addresses()).toHaveLength(1);
    });

    it('should update address', () => {
      const addressesReq = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      addressesReq.flush([mockAddress]);

      service.updateAddress('1', { label: 'Casa Actualizada' });

      const req = httpMock.expectOne('http://localhost:3000/api/users/addresses/1');
      req.flush({ ...mockAddress, label: 'Casa Actualizada' });

      expect(service.addresses()[0].label).toBe('Casa Actualizada');
    });

    it('should delete address', () => {
      const addressesReq = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      addressesReq.flush([mockAddress]);

      service.deleteAddress('1');

      const req = httpMock.expectOne('http://localhost:3000/api/users/addresses/1');
      req.flush({});

      expect(service.addresses()).toHaveLength(0);
    });

    it('should set default address', () => {
      const addressesReq = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      addressesReq.flush([mockAddress, { ...mockAddress, id: '2', isDefault: false }]);

      service.setDefaultAddress('2');

      const req = httpMock.expectOne('http://localhost:3000/api/users/addresses/2/default');
      req.flush({ ...mockAddress, id: '2', isDefault: true });

      const addresses = service.addresses();
      expect(addresses.find(a => a.id === '1')?.isDefault).toBe(false);
      expect(addresses.find(a => a.id === '2')?.isDefault).toBe(true);
    });

    it('should return default address', () => {
      const addressesReq = httpMock.expectOne('http://localhost:3000/api/users/addresses');
      addressesReq.flush([mockAddress]);

      const defaultAddr = service.defaultAddress();
      expect(defaultAddr?.id).toBe('1');
    });
  });

  describe('orders', () => {
    it('should load orders from API', () => {
      const ordersReq = httpMock.expectOne('http://localhost:3000/api/users/orders');
      ordersReq.flush([mockOrder]);

      expect(service.orders()).toHaveLength(1);
      expect(service.orders()[0].status).toBe('pending');
    });

    it('should return pending orders', () => {
      const ordersReq = httpMock.expectOne('http://localhost:3000/api/users/orders');
      ordersReq.flush([
        { ...mockOrder, status: 'pending' as OrderStatus },
        { ...mockOrder, id: '2', status: 'delivered' as OrderStatus }
      ]);

      const pending = service.pendingOrders();
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('pending');
    });

    it('should return completed orders', () => {
      const ordersReq = httpMock.expectOne('http://localhost:3000/api/users/orders');
      ordersReq.flush([
        { ...mockOrder, status: 'pending' as OrderStatus },
        { ...mockOrder, id: '2', status: 'delivered' as OrderStatus }
      ]);

      const completed = service.completedOrders();
      expect(completed).toHaveLength(1);
      expect(completed[0].status).toBe('delivered');
    });
  });
});

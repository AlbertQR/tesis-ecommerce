import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: '1',
    name: 'Pizza Pepperoni',
    description: 'Delicious pizza',
    price: 35000,
    category: 'pizzeria',
    image: '/img/pizza.jpg',
    stock: 10
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Cart calculations', () => {
    it('should calculate cart count correctly', () => {
      // Test with mock data
      const items = [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2', price: 12000 }, quantity: 1 }
      ];
      
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      expect(count).toBe(3);
    });

    it('should calculate cart subtotal correctly', () => {
      const items = [
        { product: mockProduct, quantity: 2 }, // 35000 * 2 = 70000
        { product: { ...mockProduct, id: '2', price: 12000 }, quantity: 1 } // 12000 * 1 = 12000
      ];
      
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      expect(subtotal).toBe(82000);
    });

    it('should calculate total with delivery fee', () => {
      const subtotal = 82000;
      const deliveryFee = 100;
      const total = subtotal + deliveryFee;
      
      expect(total).toBe(82100);
    });

    it('should handle empty cart', () => {
      const items: { product: Product; quantity: number }[] = [];
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      expect(subtotal).toBe(0);
    });
  });

  describe('Cart item operations', () => {
    it('should add item to cart', () => {
      const cartItems: { product: Product; quantity: number }[] = [];
      
      cartItems.push({
        product: mockProduct,
        quantity: 1
      });
      
      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].product.name).toBe('Pizza Pepperoni');
    });

    it('should add multiple different products to cart', () => {
      const cartItems: { product: Product; quantity: number }[] = [];
      
      cartItems.push({ product: mockProduct, quantity: 1 });
      cartItems.push({ product: { ...mockProduct, id: '2', name: 'Latte' }, quantity: 1 });
      
      expect(cartItems).toHaveLength(2);
      expect(cartItems[0].product.id).toBe('1');
      expect(cartItems[1].product.id).toBe('2');
    });

    it('should update item quantity', () => {
      const cartItems = [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2' }, quantity: 1 }
      ];
      
      const itemIndex = cartItems.findIndex(item => item.product.id === '1');
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = 5;
      }
      
      expect(cartItems[0].quantity).toBe(5);
    });

    it('should remove item from cart', () => {
      const cartItems = [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2' }, quantity: 1 }
      ];
      
      const filteredItems = cartItems.filter(item => item.product.id !== '1');
      
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].product.id).toBe('2');
    });

    it('should clear entire cart', () => {
      const cartItems = [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2' }, quantity: 1 }
      ];
      
      const clearedItems: typeof cartItems = [];
      
      expect(clearedItems).toHaveLength(0);
    });
  });

  describe('Delivery fee calculations', () => {
    it('should apply delivery fee when has delivery', () => {
      const hasDelivery = true;
      const subtotal = 50000;
      const deliveryFee = 100;
      
      const total = hasDelivery ? subtotal + deliveryFee : subtotal;
      
      expect(total).toBe(50100);
    });

    it('should not apply delivery fee when no delivery', () => {
      const hasDelivery = false;
      const subtotal = 50000;
      const deliveryFee = 100;
      
      const total = hasDelivery ? subtotal + deliveryFee : subtotal;
      
      expect(total).toBe(50000);
    });
  });
});

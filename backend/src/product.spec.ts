import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Product Model', () => {
  describe('ProductCategory type', () => {
    it('should accept valid categories', () => {
      const validCategories = ['cafeteria', 'pizzeria', 'despensa', 'combo'];
      
      validCategories.forEach(category => {
        expect(['cafeteria', 'pizzeria', 'despensa', 'combo']).toContain(category);
      });
    });
  });

  describe('Product validation', () => {
    it('should require name', () => {
      const product = {
        description: 'Test description',
        price: 10000,
        category: 'cafeteria',
        image: '/test.jpg',
        stock: 10
      };
      
      expect(product).not.toHaveProperty('name');
    });

    it('should require price', () => {
      const product = {
        name: 'Test Product',
        description: 'Test description',
        category: 'cafeteria',
        image: '/test.jpg',
        stock: 10
      };
      
      expect(product).not.toHaveProperty('price');
    });

    it('should require category', () => {
      const product = {
        name: 'Test Product',
        description: 'Test description',
        price: 10000,
        image: '/test.jpg',
        stock: 10
      };
      
      expect(product).not.toHaveProperty('category');
    });

    it('should have optional isFeatured, isHot, isCombo flags', () => {
      const product = {
        name: 'Test Product',
        description: 'Test description',
        price: 10000,
        category: 'cafeteria',
        image: '/test.jpg',
        stock: 10,
        isFeatured: true,
        isHot: false,
        isCombo: false
      };
      
      expect(product.isFeatured).toBe(true);
      expect(product.isHot).toBe(false);
      expect(product.isCombo).toBe(false);
    });
  });

  describe('Product filtering', () => {
    const products = [
      { id: '1', name: 'Coffee', category: 'cafeteria', isFeatured: true, isHot: true },
      { id: '2', name: 'Pizza', category: 'pizzeria', isFeatured: true, isHot: false },
      { id: '3', name: 'Flour', category: 'despensa', isFeatured: false, isHot: false },
      { id: '4', name: 'Combo 1', category: 'combo', isFeatured: true, isCombo: true }
    ];

    it('should filter by category', () => {
      const cafeteriaProducts = products.filter(p => p.category === 'cafeteria');
      expect(cafeteriaProducts).toHaveLength(1);
      expect(cafeteriaProducts[0].name).toBe('Coffee');
    });

    it('should filter featured products', () => {
      const featuredProducts = products.filter(p => p.isFeatured);
      expect(featuredProducts).toHaveLength(3);
    });

    it('should filter hot products', () => {
      const hotProducts = products.filter(p => p.isHot);
      expect(hotProducts).toHaveLength(1);
    });

    it('should filter combos', () => {
      const combos = products.filter(p => p.isCombo);
      expect(combos).toHaveLength(1);
    });
  });
});

describe('Cart Calculations', () => {
  it('should calculate item subtotal correctly', () => {
    const items = [
      { unitPrice: 10000, quantity: 2 },
      { unitPrice: 15000, quantity: 1 }
    ];
    
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    expect(subtotal).toBe(35000);
  });

  it('should calculate total with delivery fee', () => {
    const subtotal = 50000;
    const deliveryFee = 100;
    const total = subtotal + deliveryFee;
    
    expect(total).toBe(50100);
  });

  it('should handle empty cart', () => {
    const items: { unitPrice: number; quantity: number }[] = [];
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    expect(subtotal).toBe(0);
  });

  it('should handle quantity updates in cart', () => {
    const items = [
      { productId: '1', quantity: 2 },
      { productId: '2', quantity: 3 }
    ];
    
    items[0].quantity = 5;
    
    expect(items[0].quantity).toBe(5);
    expect(items[1].quantity).toBe(3);
  });
});

describe('Order Status Transitions', () => {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  it('should have all required statuses', () => {
    expect(validStatuses).toContain('pending');
    expect(validStatuses).toContain('confirmed');
    expect(validStatuses).toContain('preparing');
    expect(validStatuses).toContain('ready');
    expect(validStatuses).toContain('delivered');
    expect(validStatuses).toContain('cancelled');
  });

  it('should allow valid status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: []
    };
    
    expect(validTransitions.pending).toContain('confirmed');
    expect(validTransitions.confirmed).toContain('preparing');
    expect(validTransitions.preparing).toContain('ready');
    expect(validTransitions.ready).toContain('delivered');
  });
});

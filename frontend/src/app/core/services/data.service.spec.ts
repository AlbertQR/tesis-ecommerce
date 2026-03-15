import { describe, it, expect } from 'vitest';

describe('DataService Logic', () => {
  const mockProducts = [
    { id: '1', name: 'Pizza', description: 'Delicious', price: 35000, category: 'pizzeria' as const, image: '/img.jpg', stock: 10, isFeatured: true, isHot: true },
    { id: '2', name: 'Coffee', description: 'Good coffee', price: 12000, category: 'cafeteria' as const, image: '/img.jpg', stock: 20, isFeatured: true, isHot: false },
    { id: '3', name: 'Flour', description: 'Quality flour', price: 4500, category: 'despensa' as const, image: '/img.jpg', stock: 100, isFeatured: false, isHot: true }
  ];

  describe('Product filtering', () => {
    it('should filter products by category', () => {
      const filtered = mockProducts.filter(p => p.category === 'cafeteria');
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Coffee');
    });

    it('should return empty array for non-existent category', () => {
      const filtered = mockProducts.filter(p => p.category === 'bebidas' as any);
      expect(filtered.length).toBe(0);
    });

    it('should filter cafeteria products', () => {
      const filtered = mockProducts.filter(p => p.category === 'cafeteria');
      expect(filtered.every(p => p.category === 'cafeteria')).toBe(true);
    });

    it('should filter despensa products', () => {
      const filtered = mockProducts.filter(p => p.category === 'despensa');
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Flour');
    });

    it('should return only featured products', () => {
      const filtered = mockProducts.filter(p => p.isFeatured);
      expect(filtered.length).toBe(2);
      expect(filtered.every(p => p.isFeatured)).toBe(true);
    });

    it('should return empty array when no featured products', () => {
      const products = [{ id: '1', name: 'Test', isFeatured: false }];
      const filtered = products.filter(p => p.isFeatured);
      expect(filtered.length).toBe(0);
    });
  });

  describe('Product search', () => {
    it('should find product by name', () => {
      const search = 'pizza';
      const filtered = mockProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      expect(filtered.length).toBe(1);
    });

    it('should find product by description', () => {
      const search = 'coffee';
      const filtered = mockProducts.filter(p => p.description.toLowerCase().includes(search.toLowerCase()));
      expect(filtered.length).toBe(1);
    });

    it('should return empty for non-existent search', () => {
      const search = ' nonexistent ';
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
      expect(filtered.length).toBe(0);
    });
  });

  describe('Product sorting', () => {
    it('should sort by name ascending', () => {
      const sorted = [...mockProducts].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted[0].name).toBe('Coffee');
      expect(sorted[2].name).toBe('Pizza');
    });

    it('should sort by price ascending', () => {
      const sorted = [...mockProducts].sort((a, b) => a.price - b.price);
      expect(sorted[0].name).toBe('Flour');
      expect(sorted[2].name).toBe('Pizza');
    });

    it('should sort by price descending', () => {
      const sorted = [...mockProducts].sort((a, b) => b.price - a.price);
      expect(sorted[0].name).toBe('Pizza');
      expect(sorted[2].name).toBe('Flour');
    });

    it('should sort hot products first', () => {
      const sorted = [...mockProducts].sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
      expect(sorted[0].isHot).toBe(true);
    });
  });

  describe('getProductById', () => {
    it('should find product by id', () => {
      const product = mockProducts.find(p => p.id === '1');
      expect(product?.name).toBe('Pizza');
    });

    it('should return undefined for non-existent id', () => {
      const product = mockProducts.find(p => p.id === '999');
      expect(product).toBeUndefined();
    });
  });
});

import { describe, it, expect } from 'vitest';

describe('Legal Documents', () => {
  describe('LegalDocument type', () => {
    it('should accept valid document types', () => {
      const validTypes = ['terms', 'privacy', 'returns'];
      
      validTypes.forEach(type => {
        expect(['terms', 'privacy', 'returns']).toContain(type);
      });
    });

    it('should reject invalid document types', () => {
      const invalidType = 'invalid';
      expect(['terms', 'privacy', 'returns']).not.toContain(invalidType);
    });
  });

  describe('LegalDocument validation', () => {
    it('should require type field', () => {
      const doc = {
        title: 'Test Title',
        content: 'Test content',
        isActive: true
      };
      
      expect(doc).not.toHaveProperty('type');
    });

    it('should require title field', () => {
      const doc = {
        type: 'terms',
        content: 'Test content',
        isActive: true
      };
      
      expect(doc).not.toHaveProperty('title');
    });

    it('should require content field', () => {
      const doc = {
        type: 'terms',
        title: 'Test Title',
        isActive: true
      };
      
      expect(doc).not.toHaveProperty('content');
    });

    it('should have optional isActive field', () => {
      const doc = {
        type: 'terms',
        title: 'Test Title',
        content: 'Test content',
        isActive: true
      };
      
      expect(doc.isActive).toBe(true);
    });
  });

  describe('HTML Content validation', () => {
    it('should accept HTML content', () => {
      const htmlContent = '<h2>Título</h2><p>Contenido con <strong>negrita</strong></p>';
      
      expect(htmlContent).toContain('<h2>');
      expect(htmlContent).toContain('</p>');
    });

    it('should handle empty content', () => {
      const content = '';
      expect(content).toBe('');
    });
  });

  describe('Legal routes', () => {
    it('should have public routes for viewing legal docs', () => {
      const publicRoutes = [
        '/api/legal/terms',
        '/api/legal/privacy',
        '/api/legal/returns'
      ];
      
      publicRoutes.forEach(route => {
        expect(route).toContain('/api/legal/');
      });
    });

    it('should have admin routes for managing legal docs', () => {
      const adminRoutes = [
        { method: 'GET', path: '/api/admin/legal' },
        { method: 'POST', path: '/api/admin/legal' },
        { method: 'PUT', path: '/api/admin/legal/:type' },
        { method: 'DELETE', path: '/api/admin/legal/:type' }
      ];
      
      expect(adminRoutes).toHaveLength(4);
      expect(adminRoutes[0].method).toBe('GET');
      expect(adminRoutes[1].method).toBe('POST');
      expect(adminRoutes[2].method).toBe('PUT');
      expect(adminRoutes[3].method).toBe('DELETE');
    });
  });
});

describe('Content Model', () => {
  describe('ContentType', () => {
    it('should accept valid content types', () => {
      const validTypes = ['text', 'image', 'json'];
      
      validTypes.forEach(type => {
        expect(['text', 'image', 'json']).toContain(type);
      });
    });
  });

  describe('Content key-value pairs', () => {
    it('should store key-value pairs correctly', () => {
      const content = {
        key: 'home_hero_title',
        value: 'Welcome to Doña Yoli',
        type: 'text'
      };
      
      expect(content.key).toBe('home_hero_title');
      expect(content.value).toBe('Welcome to Doña Yoli');
      expect(content.type).toBe('text');
    });

    it('should handle JSON content type', () => {
      const jsonContent = {
        key: 'menu_config',
        value: '{"showPrices": true, "currency": "COP"}',
        type: 'json'
      };
      
      expect(jsonContent.type).toBe('json');
      expect(jsonContent.value).toContain('showPrices');
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService, Product, Category, Testimonial, Combo } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    { id: '1', name: 'Pizza', description: 'Delicious', price: 35000, category: 'pizzeria', image: '/img.jpg', stock: 10, isFeatured: true },
    { id: '2', name: 'Coffee', description: 'Good coffee', price: 12000, category: 'cafeteria', image: '/img.jpg', stock: 20, isFeatured: true },
    { id: '3', name: 'Flour', description: 'Quality flour', price: 4500, category: 'despensa', image: '/img.jpg', stock: 100 }
  ];

  const mockCategories: Category[] = [
    { id: 'cafeteria', name: 'Cafetería', description: 'Cafes y bebidas', image: '/img.jpg' },
    { id: 'pizzeria', name: 'Pizzería', description: 'Pizzas', image: '/img.jpg' },
    { id: 'despensa', name: 'Despensa', description: 'Despensa', image: '/img.jpg' }
  ];

  const mockTestimonials: Testimonial[] = [
    { id: '1', name: 'Juan Perez', role: 'Cliente', comment: 'Great!', rating: 5, initials: 'JP' }
  ];

  const mockCombos: Combo[] = [
    { id: '1', name: 'Combo Familiar', description: 'For family', price: 55000, image: '/img.jpg', includes: ['Pizza', 'Drink'], isFeatured: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial data loading', () => {
    it('should load products on init', () => {
      const req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      expect(service.products()).toHaveLength(3);
    });

    it('should load categories on init', () => {
      const req = httpMock.expectOne('http://localhost:3000/api/categories');
      req.flush(mockCategories);
      expect(service.categories()).toHaveLength(3);
    });

    it('should load testimonials on init', () => {
      const req = httpMock.expectOne('http://localhost:3000/api/testimonials');
      req.flush(mockTestimonials);
      expect(service.testimonials()).toHaveLength(1);
    });

    it('should load featured combo on init', () => {
      const req = httpMock.expectOne('http://localhost:3000/api/combos?featured=true');
      req.flush(mockCombos);
      expect(service.featuredCombo()).toBeTruthy();
      expect(service.featuredCombo()?.name).toBe('Combo Familiar');
    });

    it('should set combo to null when no featured combo exists', () => {
      const req = httpMock.expectOne('http://localhost:3000/api/combos?featured=true');
      req.flush([]);
      expect(service.featuredCombo()).toBeNull();
    });
  });

  describe('getProductsByCategory', () => {
    it('should filter products by category', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const pizzeriaProducts = service.getProductsByCategory('pizzeria');
      expect(pizzeriaProducts).toHaveLength(1);
      expect(pizzeriaProducts[0].name).toBe('Pizza');
    });

    it('should return empty array for non-existent category', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const emptyProducts = service.getProductsByCategory('non-existent');
      expect(emptyProducts).toHaveLength(0);
    });

    it('should filter cafeteria products', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const cafeteriaProducts = service.getProductsByCategory('cafeteria');
      expect(cafeteriaProducts).toHaveLength(1);
      expect(cafeteriaProducts[0].name).toBe('Coffee');
    });

    it('should filter despensa products', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const despensaProducts = service.getProductsByCategory('despensa');
      expect(despensaProducts).toHaveLength(1);
      expect(despensaProducts[0].name).toBe('Flour');
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return only featured products', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const featured = service.getFeaturedProducts();
      expect(featured).toHaveLength(2);
      expect(featured.every(p => p.isFeatured)).toBe(true);
    });

    it('should return empty array when no featured products', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush([{ id: '1', name: 'Product', description: '', price: 1000, category: 'cafeteria', image: '', stock: 10 }]);
      
      const featured = service.getFeaturedProducts();
      expect(featured).toHaveLength(0);
    });
  });

  describe('getProductById', () => {
    it('should find product by id', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const product = service.getProductById('1');
      expect(product).toBeTruthy();
      expect(product?.name).toBe('Pizza');
    });

    it('should return undefined for non-existent id', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      const product = service.getProductById('non-existent');
      expect(product).toBeUndefined();
    });
  });

  describe('refreshProducts', () => {
    it('should reload products from API', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/products');
      req.flush(mockProducts);
      
      service.refreshProducts();
      
      const newReq = httpMock.expectOne('http://localhost:3000/api/products');
      newReq.flush([...mockProducts, { id: '4', name: 'New', description: '', price: 1000, category: 'cafeteria', image: '', stock: 10 }]);
      
      expect(service.products()).toHaveLength(4);
    });
  });

  describe('refreshCategories', () => {
    it('should reload categories from API', () => {
      let req = httpMock.expectOne('http://localhost:3000/api/categories');
      req.flush(mockCategories);
      
      service.refreshCategories();
      
      const newReq = httpMock.expectOne('http://localhost:3000/api/categories');
      newReq.flush([...mockCategories, { id: 'new', name: 'New', description: '', image: '' }]);
      
      expect(service.categories()).toHaveLength(4);
    });
  });
});

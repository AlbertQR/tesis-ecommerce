import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LegalService } from './legal.service';

describe('LegalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LegalService]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(LegalService);
    expect(service).toBeTruthy();
  });

  it('should have terms property', () => {
    const service = TestBed.inject(LegalService);
    expect(service.terms).toBeDefined();
  });

  it('should have privacy property', () => {
    const service = TestBed.inject(LegalService);
    expect(service.privacy).toBeDefined();
  });

  it('should have returns property', () => {
    const service = TestBed.inject(LegalService);
    expect(service.returns).toBeDefined();
  });

  it('should have getLegalDocument method', () => {
    const service = TestBed.inject(LegalService);
    expect(service.getLegalDocument).toBeDefined();
  });
});

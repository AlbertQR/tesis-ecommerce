import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authServiceMock: { getToken: jasmine.Spy };

  const createRequest = (): HttpRequest<unknown> => {
    return new HttpRequest('GET', 'http://localhost:3000/api/test');
  };

  const nextHandler = (): Observable<HttpEvent<unknown>> => {
    return of({} as HttpEvent<unknown>);
  };

  beforeEach(() => {
    authServiceMock = {
      getToken: jasmine.createSpy('getToken')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
  });

  it('should be created', () => {
    expect(authInterceptor).toBeTruthy();
  });

  it('should add Authorization header when token exists', () => {
    authServiceMock.getToken.and.returnValue('mock-jwt-token');

    const req = createRequest();
    let modifiedReq: HttpRequest<unknown> | null = null;

    const testNext = (r: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
      modifiedReq = r;
      return of({} as HttpEvent<unknown>);
    };

    authInterceptor(req, testNext);

    expect(modifiedReq).not.toBeNull();
    expect(modifiedReq?.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });

  it('should not add Authorization header when token is null', () => {
    authServiceMock.getToken.and.returnValue(null);

    const req = createRequest();
    let modifiedReq: HttpRequest<unknown> | null = null;

    const testNext = (r: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
      modifiedReq = r;
      return of({} as HttpEvent<unknown>);
    };

    authInterceptor(req, testNext);

    expect(modifiedReq).not.toBeNull();
    expect(modifiedReq?.headers.has('Authorization')).toBe(false);
  });

  it('should not add Authorization header when token is empty string', () => {
    authServiceMock.getToken.and.returnValue('');

    const req = createRequest();
    let modifiedReq: HttpRequest<unknown> | null = null;

    const testNext = (r: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
      modifiedReq = r;
      return of({} as HttpEvent<unknown>);
    };

    authInterceptor(req, testNext);

    expect(modifiedReq).not.toBeNull();
    expect(modifiedReq?.headers.has('Authorization')).toBe(false);
  });

  it('should preserve existing headers when adding token', () => {
    authServiceMock.getToken.and.returnValue('mock-jwt-token');

    const req = createRequest().clone({
      headers: req.headers.set('Content-Type', 'application/json')
    });
    let modifiedReq: HttpRequest<unknown> | null = null;

    const testNext = (r: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
      modifiedReq = r;
      return of({} as HttpEvent<unknown>);
    };

    authInterceptor(req, testNext);

    expect(modifiedReq?.headers.get('Content-Type')).toBe('application/json');
    expect(modifiedReq?.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });

  it('should call next handler', () => {
    authServiceMock.getToken.and.returnValue('token');

    const req = createRequest();
    const nextSpy = jasmine.createSpy('next').and.returnValue(of({} as HttpEvent<unknown>));

    authInterceptor(req, nextSpy);

    expect(nextSpy).toHaveBeenCalled();
  });
});

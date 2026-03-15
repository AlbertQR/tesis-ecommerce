import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Interfaz que define la estructura de un documento legal.
 * 
 * @interface LegalDocument
 * 
 * @property {string} id - Identificador único del documento
 * @property {'terms' | 'privacy' | 'returns'} type - Tipo de documento legal
 * @property {string} title - Título del documento
 * @property {string} content - Contenido HTML del documento
 * @property {boolean} isActive - Indica si el documento está visible
 */
export interface LegalDocument {
  id: string;
  type: 'terms' | 'privacy' | 'returns';
  title: string;
  content: string;
  isActive: boolean;
}

/**
 * Servicio para gestionar los documentos legales del sitio.
 * Utiliza signals para mantener el estado reactivo de los documentos.
 * 
 * @service LegalService
 * @description Proporciona acceso a términos, políticas de privacidad y devoluciones.
 *              Los documentos se cargan automáticamente al iniciar el servicio.
 * 
 * @example
 * ```typescript
 * constructor(private legalService: LegalService) {
 *   const terms = this.legalService.terms();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LegalService {
  /** URL base del API */
  private apiUrl = 'http://localhost:3000/api';
  
  /** Signal para almacenar los términos y condiciones */
  private termsSignal = signal<LegalDocument | null>(null);
  
  /** Signal para almacenar la política de privacidad */
  private privacySignal = signal<LegalDocument | null>(null);
  
  /** Signal para almacenar la política de devoluciones */
  private returnsSignal = signal<LegalDocument | null>(null);

  /** Referencia de solo lectura al signal de términos */
  readonly terms = this.termsSignal.asReadonly();
  
  /** Referencia de solo lectura al signal de privacidad */
  readonly privacy = this.privacySignal.asReadonly();
  
  /** Referencia de solo lectura al signal de devoluciones */
  readonly returns = this.returnsSignal.asReadonly();

  /**
   * Constructor del servicio.
   * Inicia la carga de documentos legales automáticamente.
   * 
   * @param {HttpClient} http - Cliente HTTP de Angular para realizar peticiones
   */
  constructor(private http: HttpClient) {
    this.loadLegalDocuments();
  }

  /**
   * Carga los documentos legales desde el backend.
   * Se ejecuta automáticamente al crear el servicio.
   * 
   * @method loadLegalDocuments
   * @private
   */
  private loadLegalDocuments(): void {
    this.http.get<LegalDocument>(`${this.apiUrl}/legal/terms`).pipe(
    ).subscribe({
      next: doc => this.termsSignal.set(doc),
      error: () => this.termsSignal.set(null)
    });

    this.http.get<LegalDocument>(`${this.apiUrl}/legal/privacy`).pipe(
    ).subscribe({
      next: doc => this.privacySignal.set(doc),
      error: () => this.privacySignal.set(null)
    });

    this.http.get<LegalDocument>(`${this.apiUrl}/legal/returns`).pipe(
    ).subscribe({
      next: doc => this.returnsSignal.set(doc),
      error: () => this.returnsSignal.set(null)
    });
  }

  /**
   * Obtiene un documento legal específico por su tipo.
   * 
   * @method getLegalDocument
   * @param {('terms' | 'privacy' | 'returns')} type - Tipo de documento a obtener
   * @returns {LegalDocument | null} El documento solicitado o null si no existe
   * 
   * @example
   * ```typescript
   * const privacyPolicy = this.legalService.getLegalDocument('privacy');
   * ```
   */
  getLegalDocument(type: 'terms' | 'privacy' | 'returns'): LegalDocument | null {
    switch (type) {
      case 'terms': return this.termsSignal();
      case 'privacy': return this.privacySignal();
      case 'returns': return this.returnsSignal();
    }
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { LegalDocument } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class LegalService {
  private apiUrl = environment.apiUrl;
  private termsSignal = signal<LegalDocument | null>(null);
  readonly terms = this.termsSignal.asReadonly();
  private privacySignal = signal<LegalDocument | null>(null);
  readonly privacy = this.privacySignal.asReadonly();
  private returnsSignal = signal<LegalDocument | null>(null);
  readonly returns = this.returnsSignal.asReadonly();
  private http = inject(HttpClient);

  constructor() {
    this.loadLegalDocuments();
  }

  getLegalDocument(type: 'terms' | 'privacy' | 'returns'): LegalDocument | null {
    switch (type) {
      case 'terms':
        return this.termsSignal();
      case 'privacy':
        return this.privacySignal();
      case 'returns':
        return this.returnsSignal();
    }
  }

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
}

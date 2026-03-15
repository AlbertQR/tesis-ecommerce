import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { LegalDocument } from '@core/models';

@Component({
  selector: 'app-admin-legal',
  imports: [FormsModule],
  templateUrl: './admin-legal.component.html'
})
export class AdminLegalComponent implements OnInit {
  documents = signal<LegalDocument[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  editingDoc = signal<LegalDocument | null>(null);
  formData = {
    type: 'terms' as 'terms' | 'privacy' | 'returns',
    title: '',
    content: '',
    isActive: true
  };
  typeLabels: Record<string, string> = {
    terms: 'Términos y Condiciones',
    privacy: 'Política de Privacidad',
    returns: 'Política de Devoluciones'
  };
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.http.get<LegalDocument[]>(`${this.apiUrl}/admin/legal`).subscribe({
      next: (data) => {
        this.documents.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  startEdit(doc: LegalDocument): void {
    this.formData = {
      type: doc.type,
      title: doc.title,
      content: doc.content,
      isActive: doc.isActive
    };
    this.editingDoc.set(doc);
    this.isEditing.set(true);
  }

  saveDocument(): void {
    const doc = this.editingDoc();
    if (doc) {
      this.http.put<LegalDocument>(`${this.apiUrl}/admin/legal/${doc.type}`, this.formData).subscribe({
        next: (updated) => {
          this.documents.update(list => list.map(d => d.type === updated.type ? updated : d));
          this.isEditing.set(false);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editingDoc.set(null);
    this.formData = { type: 'terms', title: '', content: '', isActive: true };
  }

  toggleActive(doc: LegalDocument): void {
    const newStatus = !doc.isActive;
    this.http.put<LegalDocument>(`${this.apiUrl}/admin/legal/${doc.type}`, { isActive: newStatus }).subscribe({
      next: (updated) => {
        this.documents.update(list => list.map(d => d.type === updated.type ? updated : d));
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO');
  }
}

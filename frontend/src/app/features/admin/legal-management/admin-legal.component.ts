import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface LegalDocument {
  id: string;
  type: 'terms' | 'privacy' | 'returns';
  title: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-legal',
  imports: [FormsModule],
  templateUrl: './admin-legal.component.html',
  styleUrl: './admin-legal.component.css'
})
export class AdminLegalComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

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

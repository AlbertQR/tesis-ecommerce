import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  isSubmitting = signal(false);
  submitted = signal(false);
  error = signal('');
  subjects = [
    { value: 'general', label: 'Consulta General' },
    { value: 'pedido', label: 'Seguimiento de Pedido' },
    { value: 'queja', label: 'Queja o Reclamo' },
    { value: 'sugerencia', label: 'Sugerencia' },
    { value: 'trabajo', label: 'Trabaja con Nosotros' },
    { value: 'otro', label: 'Otro' }
  ];

  onSubmit(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.error.set('Por favor completa los campos requeridos');
      return;
    }

    if (!this.isValidForm()) {
      this.error.set('Por favor completa los campos correctamente');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    this.http.post<{ message: string }>(`${this.apiUrl}/contact`, this.formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
        this.formData = { name: '', email: '', phone: '', subject: '', message: '' };
        setTimeout(() => this.submitted.set(false), 5000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.error || 'Error al enviar el mensaje');
      }
    });
  }

  isValidForm(): boolean {
    return !!(
      this.formData.name &&
      this.formData.name.trim().length >= 2 &&
      this.formData.email &&
      this.formData.email.includes('@') &&
      this.formData.message &&
      this.formData.message.trim().length >= 10 &&
      this.formData.subject
    );
  }
}

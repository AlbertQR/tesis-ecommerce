import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = signal(false);
  submitted = signal(false);

  subjects = [
    { value: 'general', label: 'Consulta General' },
    { value: 'pedido', label: 'Seguimiento de Pedido' },
    { value: 'queja', label: 'Queja o Reclamo' },
    { value: 'sugerencia', label: 'Sugerencia' },
    { value: 'trabajo', label: 'Trabaja con Nosotros' },
    { value: 'otro', label: 'Otro' }
  ];

  onSubmit(): void {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitted.set(true);
      this.formData = { name: '', email: '', phone: '', subject: '', message: '' };
      setTimeout(() => this.submitted.set(false), 5000);
    }, 1500);
  }
}

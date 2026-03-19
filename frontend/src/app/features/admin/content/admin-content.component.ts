import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormatDatePipe } from '@shared/pipes';

interface Content {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'json';
  updatedAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  initials: string;
  image?: string;
}

@Component({
  selector: 'app-admin-content',
  imports: [FormsModule, FormatDatePipe],
  templateUrl: './admin-content.component.html'
})
export class AdminContentComponent implements OnInit {
  contents = signal<Content[]>([]);
  testimonials = signal<Testimonial[]>([]);
  activeTab = signal<'contents' | 'testimonials'>('contents');
  isLoading = signal(false);
  isEditingContent = signal(false);
  editingContent = signal<Content | null>(null);
  isEditingTestimonial = signal(false);
  editingTestimonial = signal<Testimonial | null>(null);
  isUploading = signal(false);
  contentForm = { key: '', value: '', type: 'text' as 'text' | 'image' | 'json' };
  testimonialForm = {
    name: '',
    role: '',
    comment: '',
    rating: 5,
    initials: '',
    image: '' as string | undefined
  };
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.loadContents();
    this.loadTestimonials();
  }

  loadContents(): void {
    this.isLoading.set(true);
    this.http.get<Content[]>(`${this.apiUrl}/contents`).subscribe({
      next: (data) => {
        this.contents.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadTestimonials(): void {
    this.http.get<Testimonial[]>(`${this.apiUrl}/testimonials`).subscribe({
      next: (data) => this.testimonials.set(data)
    });
  }

  startEditContent(content: Content): void {
    this.contentForm = { key: content.key, value: content.value, type: content.type };
    this.editingContent.set(content);
    this.isEditingContent.set(true);
  }

  saveContent(): void {
    const content = this.editingContent();
    if (content) {
      this.http.put<Content>(`${this.apiUrl}/contents/${content.key}`, this.contentForm).subscribe({
        next: (updated) => {
          this.contents.update(list => list.map(c => c.key === updated.key ? updated : c));
          this.isEditingContent.set(false);
        }
      });
    }
  }

  startAddContent(): void {
    this.contentForm = { key: '', value: '', type: 'text' };
    this.editingContent.set(null);
    this.isEditingContent.set(true);
  }

  saveNewContent(): void {
    this.http.post<Content>(`${this.apiUrl}/contents`, this.contentForm).subscribe({
      next: (created) => {
        this.contents.update(list => [...list, created]);
        this.isEditingContent.set(false);
      }
    });
  }

  deleteContent(key: string): void {
    if (confirm('¿Eliminar este contenido?')) {
      this.http.delete(`${this.apiUrl}/contents/${key}`).subscribe({
        next: () => {
          this.contents.update(list => list.filter(c => c.key !== key));
        }
      });
    }
  }

  startEditTestimonial(testimonial: Testimonial): void {
    this.testimonialForm = {
      name: testimonial.name,
      role: testimonial.role,
      comment: testimonial.comment,
      rating: testimonial.rating,
      initials: testimonial.initials,
      image: testimonial.image || ''
    };
    this.editingTestimonial.set(testimonial);
    this.isEditingTestimonial.set(true);
  }

  saveTestimonial(): void {
    const testimonial = this.editingTestimonial();
    if (testimonial) {
      this.http.put<Testimonial>(`${this.apiUrl}/testimonials/${testimonial.id}`, this.testimonialForm).subscribe({
        next: (updated) => {
          this.testimonials.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.isEditingTestimonial.set(false);
        }
      });
    }
  }

  startAddTestimonial(): void {
    this.testimonialForm = { name: '', role: '', comment: '', rating: 5, initials: '', image: '' };
    this.editingTestimonial.set(null);
    this.isEditingTestimonial.set(true);
  }

  saveNewTestimonial(): void {
    this.http.post<Testimonial>(`${this.apiUrl}/testimonials`, this.testimonialForm).subscribe({
      next: (created) => {
        this.testimonials.update(list => [...list, created]);
        this.isEditingTestimonial.set(false);
      }
    });
  }

  deleteTestimonial(id: string): void {
    if (confirm('¿Eliminar este testimonio?')) {
      this.http.delete(`${this.apiUrl}/testimonials/${id}`).subscribe({
        next: () => {
          this.testimonials.update(list => list.filter(t => t.id !== id));
        }
      });
    }
  }

  onImageSelected(event: Event, type: 'content' | 'testimonial'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadImage(input.files[0], type);
    }
  }

  uploadImage(file: File, type: 'content' | 'testimonial'): void {
    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData).subscribe({
      next: (response) => {
        if (type === 'content') {
          this.contentForm.value = response.url;
        } else {
          this.testimonialForm.image = response.url;
        }
        this.isUploading.set(false);
      },
      error: () => {
        this.isUploading.set(false);
        alert('Error al subir la imagen');
      }
    });
  }
}

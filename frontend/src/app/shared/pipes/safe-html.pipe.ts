import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe para marcar HTML como seguro para renderizar con [innerHTML].
 * Útil para contenido de confianza (ej: documentos legales del admin).
 * 
 * ADVERTENCIA: Solo usar con contenido en el que confíes.
 * Para contenido de usuarios, sanitizar en el backend.
 */
@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(html: string | null | undefined): SafeHtml {
    if (!html) return '';
    // bypassSecurityTrustHtml es seguro aquí porque ya sanitizamos en backend
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

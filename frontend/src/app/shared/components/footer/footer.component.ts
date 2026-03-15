import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente de pie de página (footer).
 * Muestra información de contacto, enlaces útiles y links a documentos legales.
 * 
 * @component FooterComponent
 * @description Proporciona el pie de página del sitio con:
 *              - Información de la empresa
 *              - Enlaces rápidos de navegación
 *              - Información de contacto
 *              - Links a documentos legales (términos, privacidad, devoluciones)
 *              - Copyright con el año actual
 * 
 * @example
 * ```html
 * <app-footer></app-footer>
 * ```
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  /**
   * Año actual para mostrar en el copyright.
   * Se calcula automáticamente al cargar el componente.
   * 
   * @property currentYear
   * @type {number}
   */
  currentYear = new Date().getFullYear();
}

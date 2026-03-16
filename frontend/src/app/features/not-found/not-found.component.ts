import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-brand">404</h1>
        <p class="text-2xl font-semibold text-gray-700 mt-4">Página no encontrada</p>
        <p class="text-gray-500 mt-2">La página que buscas no existe o fue movida.</p>
        <a routerLink="/"
           class="inline-block mt-8 px-6 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-hover transition-colors">
          Volver al Inicio
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}

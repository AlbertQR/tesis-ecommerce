import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex flex-col items-center justify-center" [class]="containerClass()">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      @if (showText()) {
        <p class="mt-2 text-gray-600 text-sm">{{ text() }}</p>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  text = input<string>('Cargando...');
  showText = input<boolean>(false);

  containerClass(): string {
    const base = 'py-8';
    switch (this.size()) {
      case 'sm': return `${base} py-4`;
      case 'lg': return `${base} py-12`;
      default: return `${base} py-8`;
    }
  }
}

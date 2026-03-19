import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-top-button',
  template: `
    @if (showScrollTop()) {
      <button (click)="scrollToTop()"
              class="cursor-pointer fixed bottom-6 right-6 bg-brand text-white
              w-12 h-12 rounded-full flex items-center justify-center shadow-lg
              hover:bg-brand-hover transition-all transform hover:scale-110 z-50">
        <i class="fa-solid fa-arrow-up"></i>
      </button>
    }
  `,
})
export class ScrollTopButton {
  showScrollTop = signal(false);

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

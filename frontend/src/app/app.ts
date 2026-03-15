import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from '@shares/components/navbar/navbar.component';
import { FooterComponent } from '@shares/components/footer/footer.component';
import { ScrollTopButton } from '@shares/components/scroll-top-button/scroll-top-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ScrollTopButton],
  template: `
    <app-navbar/>
    <main>
      <router-outlet/>
    </main>
    <app-footer/>
    <app-scroll-top-button/>
  `,
})
export class App implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

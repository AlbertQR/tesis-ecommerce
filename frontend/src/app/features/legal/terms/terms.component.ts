import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalService } from '@core/services/legal.service';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, SafeHtmlPipe],
  templateUrl: './terms.component.html'
})
export class TermsComponent {
  private legalService = inject(LegalService);
  document = this.legalService.terms;
}

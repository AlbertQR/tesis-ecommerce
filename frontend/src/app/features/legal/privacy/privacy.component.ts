import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalService } from '@core/services/legal.service';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, SafeHtmlPipe],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {
  private legalService = inject(LegalService);
  document = this.legalService.privacy;
}

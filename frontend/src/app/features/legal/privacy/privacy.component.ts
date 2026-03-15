import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalService } from '@core/services/legal.service';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {
  private legalService = inject(LegalService);
  document = this.legalService.privacy;
}

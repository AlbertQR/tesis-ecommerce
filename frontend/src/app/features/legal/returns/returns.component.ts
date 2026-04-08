import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalService } from '@core/services/legal.service';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-returns',
  imports: [RouterLink, SafeHtmlPipe],
  templateUrl: './returns.component.html'
})
export class ReturnsComponent {
  private legalService = inject(LegalService);
  document = this.legalService.returns;
}

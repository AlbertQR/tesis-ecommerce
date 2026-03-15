import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalService } from '@core/services/legal.service';

@Component({
  selector: 'app-returns',
  imports: [RouterLink],
  templateUrl: './returns.component.html'
})
export class ReturnsComponent {
  private legalService = inject(LegalService);
  document = this.legalService.returns;
}

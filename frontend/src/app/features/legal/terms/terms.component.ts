import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalService } from '../../../core/services/legal.service';

@Component({
  selector: 'app-terms',
  imports: [RouterLink],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent {
  private legalService = inject(LegalService);
  
  document = this.legalService.terms;
}

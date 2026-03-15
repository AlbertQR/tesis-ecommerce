import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  stats = [
    { value: '10+', label: 'Años de Exp.' },
    { value: '5k+', label: 'Clientes Felices' },
    { value: '100%', label: 'Calidad' }
  ];
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '@core/services/payment.service';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Configuracion de Pagos</h1>
      
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-bold mb-4">EnZona</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Consumer Key</label>
            <input type="text" [(ngModel)]="settings.enzona_consumer_key"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Consumer Secret</label>
            <input type="password" [(ngModel)]="settings.enzona_consumer_secret"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Merchant UUID</label>
            <input type="text" [(ngModel)]="settings.enzona_merchant_uuid"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-bold mb-4">Politicas de Reembolso</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Porcentaje de reembolso (%)</label>
            <input type="number" [(ngModel)]="settings.refund_percentage"
                   min="0" max="100"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <p class="text-sm text-gray-500 mt-1">Ejemplo: 80 significa que se reembolsara el 80% del valor</p>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="refundEnabled"
                   id="refundEnabled"
                   class="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand">
            <label for="refundEnabled" class="ml-2 text-sm text-gray-700">
              Habilitar reembolsos
            </label>
          </div>
        </div>
      </div>
      
      <div class="flex gap-4">
        <button (click)="saveSettings()"
                [disabled]="isSaving()"
                class="px-6 py-2 bg-brand text-white font-bold rounded-lg hover:bg-brand-hover disabled:opacity-50">
          @if (isSaving()) {
            <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
          } @else {
            Guardar Configuracion
          }
        </button>
        <button (click)="loadSettings()"
                class="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">
          Cancelar
        </button>
      </div>
      
      @if (message()) {
        <div class="mt-4 p-3 rounded-lg" 
             [class.bg-green-100]="messageType() === 'success'"
             [class.text-green-700]="messageType() === 'success'"
             [class.bg-red-100]="messageType() === 'error'"
             [class.text-red-700]="messageType() === 'error'">
          {{ message() }}
        </div>
      }
    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  
  settings = {
    enzona_consumer_key: '',
    enzona_consumer_secret: '',
    enzona_merchant_uuid: '',
    refund_percentage: '80'
  };
  
  refundEnabled = true;
  isSaving = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.paymentService.getSettings().subscribe({
      next: (settings) => {
        this.settings = {
          enzona_consumer_key: settings.enzona_consumer_key || '',
          enzona_consumer_secret: settings.enzona_consumer_secret || '',
          enzona_merchant_uuid: settings.enzona_merchant_uuid || '',
          refund_percentage: settings.refund_percentage || '80'
        };
        this.refundEnabled = settings.refund_enabled === 'true';
      },
      error: () => {
        this.message.set('Error al cargar la configuracion');
        this.messageType.set('error');
      }
    });
  }

  saveSettings(): void {
    this.isSaving.set(true);
    this.message.set('');
    
    this.paymentService.updateSettings({
      enzona_consumer_key: this.settings.enzona_consumer_key,
      enzona_consumer_secret: this.settings.enzona_consumer_secret,
      enzona_merchant_uuid: this.settings.enzona_merchant_uuid,
      refund_percentage: this.settings.refund_percentage,
      refund_enabled: this.refundEnabled ? 'true' : 'false'
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.message.set('Configuracion guardada correctamente');
        this.messageType.set('success');
      },
      error: () => {
        this.isSaving.set(false);
        this.message.set('Error al guardar la configuracion');
        this.messageType.set('error');
      }
    });
  }
}

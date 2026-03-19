import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '@core/services/payment.service';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Configuración de Pagos</h1>

      <!-- EnZona Status -->
      @if (enzonaConfigured()) {
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3
          rounded mb-6">
          <i class="fa-solid fa-check-circle mr-2"></i>
          EnZona está configurado y activo
        </div>
      } @else {
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3
          rounded mb-6">
          <i class="fa-solid fa-exclamation-triangle mr-2"></i>
          EnZona no está configurado. Completa los datos para habilitar pagos.
        </div>
      }

      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-bold mb-4">EnZona</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Consumer Key
            </label>
            <input type="text" [(ngModel)]="settings().enzona_consumer_key"
                   placeholder="Ingresa el consumer key"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <p class="text-xs text-gray-500 mt-1">
              Deja vacío para mantener el valor actual
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Consumer Secret
            </label>
            <input type="password" [(ngModel)]="settings().enzona_consumer_secret"
                   placeholder="Ingresa el consumer secret"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <p class="text-xs text-gray-500 mt-1">
              Deja vacío para mantener el valor actual
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Merchant UUID
            </label>
            <input type="text" [(ngModel)]="settings().enzona_merchant_uuid"
                   placeholder="Ingresa el merchant UUID"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-lg font-bold mb-4">Políticas de Reembolso</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje de reembolso (%)
            </label>
            <input type="number" [(ngModel)]="settings().refund_percentage"
                   min="0" max="100"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <p class="text-sm text-gray-500 mt-1">
              Ejemplo: 80 significa que se reembolsará el 80% del valor
            </p>
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
                class="px-6 py-2 bg-brand text-white font-bold rounded-lg
                hover:bg-brand-hover disabled:opacity-50">
          @if (isSaving()) {
            <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
          } @else {
            Guardar Configuración
          }
        </button>
        <button (click)="loadSettings()"
                class="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg
                hover:bg-gray-300">
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
  settings = signal({
    enzona_consumer_key: '',
    enzona_consumer_secret: '',
    enzona_merchant_uuid: '',
    refund_percentage: '80'
  });
  enzonaConfigured = signal(false);
  refundEnabled = signal(true);
  isSaving = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  private paymentService = inject(PaymentService);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.paymentService.getSettings().subscribe({
      next: (settings) => {
        this.settings.set({
          enzona_consumer_key: '',
          enzona_consumer_secret: '',
          enzona_merchant_uuid: settings.enzona_merchant_uuid || '',
          refund_percentage: settings.refund_percentage || '80'
        });
        this.refundEnabled.set(settings.refund_enabled === 'true');
        this.enzonaConfigured.set(settings.enzona_configured === 'true');
      },
      error: () => {
        this.message.set('Error al cargar la configuración');
        this.messageType.set('error');
      }
    });
  }

  saveSettings(): void {
    this.isSaving.set(true);
    this.message.set('');

    const currentSettings = this.settings();

    this.paymentService.updateSettings({
      enzona_consumer_key: currentSettings.enzona_consumer_key,
      enzona_consumer_secret: currentSettings.enzona_consumer_secret,
      enzona_merchant_uuid: currentSettings.enzona_merchant_uuid,
      refund_percentage: currentSettings.refund_percentage,
      refund_enabled: this.refundEnabled() ? 'true' : 'false'
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.message.set('Configuración guardada correctamente');
        this.messageType.set('success');
        this.loadSettings();
      },
      error: () => {
        this.isSaving.set(false);
        this.message.set('Error al guardar la configuración');
        this.messageType.set('error');
      }
    });
  }
}

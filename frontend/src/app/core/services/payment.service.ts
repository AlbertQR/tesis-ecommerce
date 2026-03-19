import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { PaymentResponse, PaymentSettings } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createPayment(orderId: string) {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/payments`, { orderId });
  }

  refundPayment(orderId: string) {
    return this.http.post<{ success: boolean; refundAmount: number; percentage: number }>(
      `${this.apiUrl}/payments/refund`,
      { orderId }
    );
  }

  getSettings() {
    return this.http.get<PaymentSettings>(`${this.apiUrl}/payments/settings`);
  }

  updateSettings(settings: Partial<PaymentSettings>) {
    return this.http.put(`${this.apiUrl}/payments/settings`, settings);
  }
}

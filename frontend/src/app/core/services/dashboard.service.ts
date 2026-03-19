import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DashboardData } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStats() {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/stats`);
  }
}

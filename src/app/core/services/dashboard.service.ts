import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  TotalAPInvoices: number;
  TotalARInvoices: number;
  TotalVendors: number;
  TotalCustomers: number;
  TotalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://localhost:7176/api/Dashboard';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getARInvoices(): Observable<any> {
    return this.http.get<any>('https://localhost:7176/api/ARInvoice');
  }

  getAPInvoices(): Observable<any> {
    return this.http.get<any>('https://localhost:7176/api/APInvoice');
  }
}

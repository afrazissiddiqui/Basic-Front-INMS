import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface APInvoiceLine {
  ItemId: number;
  Quantity: number;
  UnitPrice: number;
  VatId: number;
}

export interface APInvoice {
  Id?: number;
  InvoiceNumber: string;
  InvoiceDate: string;
  BusinessPartnerId: number;
  Lines: APInvoiceLine[];
}

@Injectable({
  providedIn: 'root'
})
export class ApInvoiceService {
  private apiUrl = 'https://localhost:7176/api/APInvoice';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addInvoice(payload: APInvoice): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateInvoice(id: number, payload: APInvoice): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteInvoice(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

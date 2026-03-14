import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ARInvoiceLine {
  ItemId: number;
  Quantity: number;
  UnitPrice: number;
  VatId: number;
}

export interface ARInvoice {
  Id?: number;
  InvoiceNumber: string;
  InvoiceDate: string;
  BusinessPartnerId: number;
  Lines: ARInvoiceLine[];
}

@Injectable({
  providedIn: 'root'
})
export class ArInvoiceService {
  private apiUrl = 'https://localhost:7176/api/ARInvoice';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addInvoice(payload: ARInvoice): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateInvoice(id: number, payload: ARInvoice): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteInvoice(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

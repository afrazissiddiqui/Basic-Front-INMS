import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VAT {
  Id: number;
  Code: string;
  Description: string;
  Rate: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreateVATPayload {
  Code: string;
  Description: string;
  Rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class VatService {
  private apiUrl = 'https://localhost:7176/api/VAT';

  constructor(private http: HttpClient) {}

  getVATs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getVATById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addVAT(payload: CreateVATPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateVAT(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteVAT(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

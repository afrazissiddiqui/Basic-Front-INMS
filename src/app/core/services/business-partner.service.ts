import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusinessPartner {
  Id: number;
  FirstName: string;
  LastName: string;
  BusinessName: string;
  BusinessAddress: string;
  Type: string;
  base64?: string;
  CNIC: string;
  NTN: string;
  Email: string;
  PhoneNumber: string;
  IsFiler: boolean;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: number;
  UpdatedBy: number;
}

export interface CreateBusinessPartnerPayload {
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: number;
  UpdatedBy: number;
  FirstName: string;
  LastName: string;
  BusinessName: string;
  BusinessAddress: string;
  Type: string;
  base64: string;
  CNIC: string;
  NTN: string;
  Email: string;
  PhoneNumber: string;
  IsFiler: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessPartnerService {
  private apiUrl = 'https://localhost:7176/api/BusinessPartners';

  constructor(private http: HttpClient) {}

  getBusinessPartners(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getBusinessPartnerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addBusinessPartner(payload: CreateBusinessPartnerPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateBusinessPartner(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteBusinessPartner(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

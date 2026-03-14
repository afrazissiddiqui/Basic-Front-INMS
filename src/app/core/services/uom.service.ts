import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnitOfMeasure {
  Id: number;
  Name: string;
  Abbreviation: string;
  IsActive: boolean;
  CreatedAt: string;
}

export interface CreateUomPayload {
  Name: string;
  Abbreviation: string;
}

@Injectable({
  providedIn: 'root'
})
export class UomService {
  private apiUrl = 'https://localhost:7176/api/UnitOfMeasure';

  constructor(private http: HttpClient) {}

  getUoms(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getUomById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addUom(payload: CreateUomPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateUom(id: number, payload: CreateUomPayload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteUom(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

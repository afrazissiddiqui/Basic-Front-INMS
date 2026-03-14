import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  Id: number;
  Name: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateCategoryPayload {
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: number;
  UpdatedBy: number;
  Name: string;
  Base64: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:7176/api/Categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addCategory(payload: CreateCategoryPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateCategory(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }
}

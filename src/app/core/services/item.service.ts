import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  Id: number;
  ItemName: string;
  CategoryName: string;
  StockQuantity: number;
  UnitAbbreviation: string;
  // Add other fields as needed based on the response
}

export interface CreateItemPayload {
  ItemName: string;
  CategoryId: number;
  UnitAbbreviation: string;
  StockQuantity: number;
  AllowNegativeInventory: boolean;
}

export interface ApiResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'https://localhost:7176/api/Items';

  constructor(private http: HttpClient) {}

  getItems(pageNumber: number = 1, pageSize: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addItem(payload: CreateItemPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateItem(id: number, payload: CreateItemPayload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

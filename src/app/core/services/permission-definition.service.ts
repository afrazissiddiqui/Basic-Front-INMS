import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PermissionDefinition {
  Id: number;
  Name: string;
  Description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionDefinitionService {
  private apiUrl = 'https://localhost:7176/api/AssignPermissions/permissions';

  constructor(private http: HttpClient) { }

  getPermissions(): Observable<PermissionDefinition[]> {
    return this.http.get<PermissionDefinition[]>(this.apiUrl);
  }

  getPermissionById(id: number): Observable<PermissionDefinition> {
    return this.http.get<PermissionDefinition>(`${this.apiUrl}/${id}`);
  }
}

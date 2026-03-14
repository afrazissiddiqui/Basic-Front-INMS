import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssignPermission } from './permission.service';

export interface Role {
  Id: number;
  Name: string;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CreatedBy: number;
  UpdatedBy: number;
  AssignPermissions?: AssignPermission[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'https://localhost:7176/api/Roles';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  addRole(payload: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, payload);
  }

  updateRole(id: number, payload: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, payload);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

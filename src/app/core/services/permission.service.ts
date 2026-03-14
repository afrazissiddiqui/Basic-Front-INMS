import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RoleService } from './role.service';

export interface AssignPermission {
  Id?: number;
  RoleId: number;
  PermissionId: number;
  PermissionName?: string;
  CanCreate: boolean;
  CanUpdate: boolean;
  CanRead: boolean;
  CanDelete: boolean;
  IsActive?: boolean;
  IsDeleted?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
  CreatedBy?: number;
  UpdatedBy?: number;
  Role?: {
    Id: number;
    Name: string;
    IsActive: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = 'https://localhost:7176/api/AssignPermissions';

  constructor(
    private http: HttpClient,
    private roleService: RoleService
  ) { }

  getPermissions(): Observable<AssignPermission[]> {
    return this.roleService.getRoles().pipe(
      map(response => {
        const roles = Array.isArray(response) ? response : (response as any).Data || [];
        const flattened: AssignPermission[] = [];
        roles.forEach((role: any) => {
          if (role.AssignPermissions && Array.isArray(role.AssignPermissions)) {
            role.AssignPermissions.forEach((p: any) => {
              flattened.push({
                ...p,
                Role: { Id: role.Id, Name: role.Name, IsActive: role.IsActive }
              });
            });
          }
        });
        return flattened;
      })
    );
  }

  getPermissionById(id: number): Observable<AssignPermission> {
    return this.http.get<AssignPermission>(`${this.apiUrl}/${id}`);
  }

  assignPermission(payload: AssignPermission): Observable<AssignPermission> {
    return this.http.post<AssignPermission>(this.apiUrl, payload);
  }

  updatePermission(id: number, payload: AssignPermission): Observable<AssignPermission> {
    return this.http.put<AssignPermission>(`${this.apiUrl}/${id}`, payload);
  }

  deletePermission(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getPermissionsByRole(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-role/${roleId}`);
  }
}

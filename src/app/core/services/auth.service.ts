import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface Permission {
  Id: number;
  RoleId: number;
  PermissionId: number;
  PermissionName: string;
  CanCreate: boolean;
  CanUpdate: boolean;
  CanRead: boolean;
  CanDelete: boolean;
}

export interface User {
  UserId: number;
  Email: string;
  FullName: string;
  Role: string;
  Permissions: Permission[];
}

export interface AuthResponse {
  Code: number;
  Msg: string;
  Data: User;
}

export interface LoginPayload {
  Email: string;
  Password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.userSubject.asObservable();
  
  private apiUrl = 'https://localhost:7176/api/Auth';

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        this.userSubject.next(JSON.parse(userJson));
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.Code === 200 && response.Data) {
          localStorage.setItem('currentUser', JSON.stringify(response.Data));
          this.userSubject.next(response.Data);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
}

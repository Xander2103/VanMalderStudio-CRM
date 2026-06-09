import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  email: string;
  expiresAt: string;
}

export interface AdminAccount {
  email: string;
}

export interface UpdateCredentialsRequest {
  currentPassword: string;
  newEmail?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://localhost:7242/api/Auth';
  private readonly tokenKey = 'crm_auth_token';
  private readonly expiresKey = 'crm_auth_expires';
  private readonly emailKey = 'crm_auth_email';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password } as LoginRequest)
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.expiresKey, res.expiresAt);
          localStorage.setItem(this.emailKey, res.email);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.emailKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expires = localStorage.getItem(this.expiresKey);
    if (expires && new Date(expires) <= new Date()) {
      this.logout();
      return false;
    }

    return true;
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  getMe(): Observable<AdminAccount> {
    return this.http.get<AdminAccount>(`${this.apiUrl}/me`);
  }

  updateCredentials(request: UpdateCredentialsRequest): Observable<AdminAccount> {
    return this.http.put<AdminAccount>(`${this.apiUrl}/credentials`, request);
  }
}

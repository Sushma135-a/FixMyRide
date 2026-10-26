import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // Use relative URLs so Angular's dev-server proxy can avoid CORS issues.
  // Backend AuthController is currently mapped under /api/users.
  private baseUrl = '/api/users';
  private adminUrl = '/api/admin';
  private userUrl = '/api/user';

  constructor(private http: HttpClient) {}

  adminLogin(username: string, password: string) {
    return this.http.post(`${this.adminUrl}/login`,
      { username, password },
      { responseType: 'text' }
    );
  }

  login(admin:any) {
    // Some backends return plain text (token/message) instead of JSON.
    // Request text to avoid JSON parse errors that send responses to the error handler.
    return this.http.post(`${this.adminUrl}/login`, admin, { responseType: 'text' });
  }

  register(user: any) {
    // Some backends return plain text (message) instead of JSON.
    // Request text to avoid JSON parse errors that would trigger the error handler.
    return this.http.post<any>(`${this.baseUrl}/register`, user, { responseType: 'text' as 'json' });
  }

  // User login endpoint
  userLogin(email: string, password: string) {
    // Some backends return plain text instead of JSON. Request text but keep typing as `any`.
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }, { responseType: 'text' as 'json' });
  }

}

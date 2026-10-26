import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { user } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Relative URL to work with Angular dev-server proxy
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<user[]> {
    return this.http.get<user[]>(`${this.baseUrl}`);
  }

  getUserById(id: string): Observable<user> {
    return this.http.get<user>(`${this.baseUrl}/${id}`);
  }

  updateUser(user: user): Observable<user> {
    return this.http.put<user>(`${this.baseUrl}/${user.id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}


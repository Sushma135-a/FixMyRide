import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../model/feedback';
@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  // Relative URL to work with Angular dev-server proxy
  private baseUrl = '/api/feedback';

  constructor(private http: HttpClient) {}

  submitFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, feedback);
  }

  getAllFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/admin/all`);
  }

  getFeedbackByUser(userId: string): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/user/${userId}`);
  }

  deleteFeedback(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}


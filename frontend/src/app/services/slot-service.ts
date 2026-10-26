import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSlot } from '../model/slot';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  // Relative URL to work with Angular dev-server proxy
  private baseUrl = '/api/slots';

  constructor(private http: HttpClient) {}

  getAvailableSlots(date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/available?date=${date}`);
  }

  bookSlot(slotId: string): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(`${this.baseUrl}/${slotId}/book`, {});
  }

  getAllSlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(this.baseUrl);
  }

  createSlot(slot: TimeSlot): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(this.baseUrl, slot);
  }

  updateSlot(id: string, slot: TimeSlot): Observable<TimeSlot> {
    return this.http.put<TimeSlot>(`${this.baseUrl}/${id}`, slot);
  }

  deleteSlot(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

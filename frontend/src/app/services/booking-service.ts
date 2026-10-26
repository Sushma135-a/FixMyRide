import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../model/booking';
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  // Relative URL to work with Angular dev-server proxy
  private baseUrl = '/api/bookings';

   constructor(private http: HttpClient) {}

  // CREATE BOOKING (USER)
  // Use a loose type here because the backend booking DTO (carCompany, carModel, etc.)
  // is different from the frontend Booking model.
  createBooking(booking: any, userId: number): Observable<any> {
    // Some backends respond with plain text instead of JSON; request text to avoid parse errors
    return this.http.post<any>(
      `${this.baseUrl}/user/${userId}`,
      booking,
      { responseType: 'text' as 'json' }
    );
  }

  // GET ALL BOOKINGS (ADMIN)
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/admin`);
  }

  // GET BOOKINGS BY USER
  getUserBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/user/${userId}`);
  }

  // UPDATE BOOKING STATUS
  updateBookingStatus(id: string, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}/status`, { status });
  }

  // UPDATE BOOKING PARTS AND CHARGES
  updateBookingParts(id: string, parts: any[], serviceCharge: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/parts`, { parts, serviceCharge });
  }

  // UPDATE PAYMENT STATUS
  updatePaymentStatus(id: string, paymentStatus: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/payment`, { paymentStatus });
  }

  // DELETE BOOKING
  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

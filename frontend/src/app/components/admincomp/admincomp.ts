import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Booking } from '../../model/booking';
import { user } from '../../model/user';
import { Feedback } from '../../model/feedback';
import { OnInit } from '@angular/core';
import { BookingService } from '../../services/booking-service';
import { UserService } from '../../services/user-service';
import { FeedbackService } from '../../services/feedback-service';
import { AuthService } from '../../services/auth-service';
import { Admin } from '../../model/admin';

@Component({
  selector: 'app-admincomp',
  standalone: false,
  templateUrl: './admincomp.html',
  styleUrls: ['./admincomp.css'],
})
export class Admincomp implements OnInit {
  activeTab: string = 'dashboard';
  darkMode: boolean = false;

  // Dashboard stats
  totalBookings: number = 0;
  confirmed: number = 0;
  pending: number = 0;
  completed: number = 0;
  inProgress: number = 0;
  awaitingParts: number = 0;
  totalUsers: number = 0;
  totalRevenue: number = 0;

  // Bookings
  bookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  // Must match backend enum BookingStatus: [CANCELLED, COMPLETED, ACCEPTED, PENDING]
  bookingStatuses = ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];

  // Users
  users: user[] = [];
  selectedUser: user | null = null;

  // Feedback
  feedbacks: Feedback[] = [];

  // Notification
  notificationMessage: string = '';
  showNotification: boolean = false;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private userService: UserService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit() {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        // Apply any locally stored status overrides so that
        // selections made earlier (PENDING / ACCEPTED / COMPLETED / CANCELLED)
        // are preserved even if the backend still returns an old status.
        try {
          const rawOverrides = localStorage.getItem('bookingStatusOverrides');
          const overrides = rawOverrides ? JSON.parse(rawOverrides) : {};
          this.bookings = bookings.map((b: any) => {
            const override = overrides[b.id];
            return override
              ? { ...b, status: String(override).toUpperCase() }
              : b;
          });
        } catch (e) {
          console.error('Failed to read bookingStatusOverrides from localStorage', e);
          this.bookings = bookings;
        }
        this.calculateStats(bookings);
      },
      error: (err) => console.error('Error loading bookings:', err)
    });

   this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
        this.users = users;
      },
      error: (err) => console.error('Error loading users:', err)
    });

    this.feedbackService.getAllFeedback().subscribe({
      next: (feedbacks) => {
        this.feedbacks = feedbacks;
      },
      error: (err) => console.error('Error loading feedback:', err)
    });
  }

  calculateStats(bookings: Booking[]) {
    this.totalBookings = bookings.length;
    // Map to backend enum values
    this.pending = bookings.filter(b => b.status === 'PENDING').length;
    this.confirmed = bookings.filter(b => b.status === 'ACCEPTED').length;
    this.completed = bookings.filter(b => b.status === 'COMPLETED').length;
    // For now, treat ACCEPTED as "in progress" as well
    this.inProgress = this.confirmed;
    this.awaitingParts = 0;
    this.totalRevenue = bookings
      .filter(b => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'bookings' || tab === 'users' || tab === 'feedback') {
      this.loadDashboardData();
    }
  }

  updateBookingStatus(bookingId: string, status: string) {
    this.bookingService.updateBookingStatus(bookingId, status).subscribe({
      next: () => {
        // Also cache the latest status in localStorage so the user
        // dashboard can immediately reflect admin changes even if
        // backend/user endpoint lags behind.
        try {
          const raw = localStorage.getItem('bookingStatusOverrides');
          const overrides = raw ? JSON.parse(raw) : {};
          overrides[bookingId] = status;
          localStorage.setItem('bookingStatusOverrides', JSON.stringify(overrides));
        } catch (e) {
          console.error('Failed to write bookingStatusOverrides to localStorage', e);
        }
        this.showNotificationMessage('Booking status updated.');
        this.loadDashboardData();
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }

  updateBookingParts(booking: Booking) {
    if (!booking.parts) {
      booking.parts = [];
    }
    const partsTotal = booking.parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const subtotal = partsTotal + booking.serviceCharge;
    const gst = subtotal * 0.05;
    booking.totalAmount = subtotal + gst;

    this.bookingService.updateBookingParts(booking.id, booking.parts, booking.serviceCharge).subscribe({
      next: () => {
        this.showNotificationMessage('Parts and charges updated.');
        this.loadDashboardData();
      },
      error: (err) => console.error('Error updating parts:', err)
    });
  }

  addPart(booking: Booking) {
    if (!booking.parts) {
      booking.parts = [];
    }
    booking.parts.push({ name: '', price: 0, quantity: 1, total: 0 });
  }

  /**
   * Sanitize quantity so that it always stays between 1 and 9 (single digit)
   */
  onQuantityInput(part: any) {
    if (part == null) {
      return;
    }
    let qty = Number(part.quantity || 0);
    if (isNaN(qty) || qty < 1) {
      qty = 1;
    }
    if (qty > 9) {
      qty = 9;
    }
    part.quantity = qty;
  }

  /**
   * Limit part price to at most 8 digits.
   * This keeps very large numbers from being entered accidentally.
   */
  onPriceInput(part: any) {
    if (part == null || part.price == null) {
      return;
    }
    let numeric = part.price.toString().replace(/\D/g, '');
    if (!numeric) {
      part.price = 0;
      return;
    }
    if (numeric.length > 8) {
      numeric = numeric.slice(0, 8);
    }
    part.price = parseInt(numeric, 10);
  }

  removePart(booking: Booking, index: number) {
    if (booking.parts) {
      booking.parts.splice(index, 1);
    }
  }

  calculatePartTotal(part: any) {
    part.total = part.price * part.quantity;
  }

  /**
   * Limit service charge to at most 6 digits (e.g. up to 999999).
   */
  onServiceChargeInput(booking: Booking) {
    if (!booking) {
      return;
    }
    if (booking.serviceCharge == null) {
      booking.serviceCharge = 0;
      return;
    }
    let numeric = booking.serviceCharge.toString().replace(/\D/g, '');
    if (!numeric) {
      booking.serviceCharge = 0;
      return;
    }
    if (numeric.length > 6) {
      numeric = numeric.slice(0, 6);
    }
    booking.serviceCharge = parseInt(numeric, 10);
  }

  calculatePartsTotal(booking: Booking): number {
    if (!booking || !booking.parts || booking.parts.length === 0) return 0;
    return booking.parts.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
  }

  calculateSubtotal(booking: Booking): number {
    const partsTotal = this.calculatePartsTotal(booking);
    const serviceCharge = booking.serviceCharge || 0;
    return partsTotal + serviceCharge;
  }

  calculateGST(booking: Booking): number {
    return this.calculateSubtotal(booking) * 0.05;
  }

  downloadInvoice(booking: Booking) {
    // In a real app, this would generate and download a PDF
    alert('Invoice download functionality would be implemented here');
  }

  updatePaymentStatus(bookingId: string, status: string) {
    this.bookingService.updatePaymentStatus(bookingId, status).subscribe({
      next: () => {
        this.showNotificationMessage('Payment status updated.');
        this.loadDashboardData();
      },
      error: (err) => console.error('Error updating payment:', err)
    });
  }

  selectUser(user: user) {
    this.selectedUser = user;
  }

  deleteUser(userId: any) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.showNotificationMessage('User deleted successfully.');
          this.loadDashboardData();
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  deleteFeedback(feedbackId: string) {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.deleteFeedback(feedbackId).subscribe({
        next: () => {
          this.showNotificationMessage('Feedback deleted successfully.');
          this.loadDashboardData();
        },
        error: (err) => console.error('Error deleting feedback:', err)
      });
    }
  }

  showNotificationMessage(message: string) {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  logout() {
    localStorage.removeItem('admin');
    this.router.navigateByUrl('/');
  }
}

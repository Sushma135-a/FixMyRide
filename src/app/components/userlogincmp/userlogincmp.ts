import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { FeedbackService } from '../../services/feedback-service';
import { SlotService } from '../../services/slot-service';
import { Booking } from '../../model/booking';
import { user } from '../../model/user';
import { Feedback } from '../../model/feedback';
import { SERVICE_OPTIONS } from '../../model/service';
import { OnInit } from '@angular/core';
import { TimeSlot } from '../../model/slot';
import { DEFAULT_TIME_SLOTS } from '../../model/slot';




@Component({
  selector: 'app-userlogincmp',
  standalone: false,
  templateUrl: './userlogincmp.html',
  styleUrls: ['./userlogincmp.css'],
})
export class Userlogincmp implements OnInit, OnDestroy {
  activeView: string = 'dashboard';
  darkMode: boolean = false;
  showFeedbackModal: boolean = false;

  // User info
  currentUser: user | null = null;

  // Booking form
  booking: Booking = {} as Booking;
  serviceOptions = SERVICE_OPTIONS;
  timeSlots: any[] = [];
  selectedTimeSlot: string = '';
  selectedDate: string = '';
  minDate: string = '';

  // User bookings
  userBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedServiceFilter: string = 'All Services';
  selectedStatusFilter: string = 'All Statuses';
  searchQuery: string = '';

  // Feedback
  feedback: Feedback = new Feedback();
  feedbackCategories = ['Service Quality', 'Staff Behavior', 'Pricing', 'Timeliness', 'Facility', 'Other'];

  // Notification
  notificationMessage: string = '';
  showNotification: boolean = false;
  // Booking success modal
  showBookingSuccessModal: boolean = false;

  // Interval id for auto-refreshing bookings when admin updates status
  private bookingsPollIntervalId: any;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private feedbackService: FeedbackService,
    private slotService: SlotService
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    } else {
      const adminStr = localStorage.getItem('admin');
      if (adminStr) {
        this.router.navigateByUrl('/admin');
        return;
      }
      this.router.navigateByUrl('/userlogin');
      return;
    }

    // Load bookings and initialize form
    this.loadUserBookings();
    this.startBookingsPolling();
    this.initializeBooking();

    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    // Clear polling interval when component is destroyed
    if (this.bookingsPollIntervalId) {
      clearInterval(this.bookingsPollIntervalId);
    }
  }

  initializeBooking() {
    this.booking = {
      id: '',
      customerName: this.currentUser?.fullName || '',
      customerLastName: this.currentUser?.lastName || '',
      customerEmail: this.currentUser?.email || '',
      customerMobile: this.currentUser?.phone || '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleRegistrationNumber: '',
      serviceType: '',
      serviceBookingDate: '',
      timeSlot: '',
      status: 'PENDING',
      additionalInformation: '',
      parts: [],
      serviceCharge: 0,
      totalAmount: 0,
      paymentStatus: 'Pending',
      userId: this.currentUser?.id?.toString() || ''
    };

    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];

    // Initialize time slots with availableSlots
    this.loadAvailableSlots();
  }

  loadUserBookings() {
    if (this.currentUser?.id) {
      this.bookingService.getUserBookings(this.currentUser.id).subscribe({
        next: (bookings) => {
          // Normalize status field so that any backend field / casing differences
          // (e.g. bookingStatus, status, etc.) are mapped into booking.status.
          // Prefer bookingStatus if it exists, since some APIs expose that
          // while also sending a stale "status" field.
          let normalized = bookings.map((b: any) => {
            const rawStatus = (b.bookingStatus ?? b.status ?? 'PENDING').toString();
            return {
              ...b,
              status: rawStatus.toUpperCase(),
            } as Booking;
          });

          // Apply any local overrides that the admin dashboard might have
          // written into localStorage when updating booking status.
          try {
            const rawOverrides = localStorage.getItem('bookingStatusOverrides');
            const overrides = rawOverrides ? JSON.parse(rawOverrides) : {};
            normalized = normalized.map((b: Booking) => {
              const override = overrides[(b as any).id];
              return override
                ? { ...b, status: String(override).toUpperCase() }
                : b;
            });
          } catch (e) {
            console.error('Failed to read bookingStatusOverrides from localStorage', e);
          }

          this.userBookings = normalized;
          this.filterBookings();
        },
        error: (err) => {
          console.error('Error loading bookings:', err);
          // For demo purposes, use empty array
          this.userBookings = [];
          this.filterBookings();
        }
      });
    }
  }

  /**
   * Periodically refresh user bookings so that any status change
   * done by the admin (PENDING, ACCEPTED, COMPLETED, CANCELLED)
   * is reflected automatically in the user dashboard.
   */
  private startBookingsPolling() {
    if (this.bookingsPollIntervalId) {
      clearInterval(this.bookingsPollIntervalId);
    }
    // Refresh every 10 seconds; adjust as needed
    this.bookingsPollIntervalId = setInterval(() => {
      this.loadUserBookings();
    }, 10000);
  }

  filterBookings() {
    this.filteredBookings = this.userBookings.filter(booking => {
      const serviceName = booking.serviceType || booking.selectedServices || '';
      const matchesService = this.selectedServiceFilter === 'All Services' ||
                            serviceName === this.selectedServiceFilter;
      const matchesStatus = this.selectedStatusFilter === 'All Statuses' ||
                           booking.status === this.selectedStatusFilter;
      const matchesSearch = !this.searchQuery ||
                           (booking.customerName || booking.user?.fullName || '')
                             .toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           (booking.vehicleRegistrationNumber || booking.carModel || '')
                             .toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           serviceName.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesService && matchesStatus && matchesSearch;
    });
  }

  onServiceChange() {
    const selectedService = this.serviceOptions.find(s => s.name === this.booking.serviceType);
    if (selectedService) {
      this.booking.serviceCharge = selectedService.basePrice;
    }
  }

  onDateChange() {
    if (this.selectedDate) {
      this.booking.serviceBookingDate = this.selectedDate;
      // Load available slots for the selected date
      this.loadAvailableSlots();
    }
  }

  loadAvailableSlots() {
    // In a real app, this would fetch from the backend
    // For now, we'll use the default slots
    this.timeSlots = DEFAULT_TIME_SLOTS.map(slot => ({
      id: '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: this.selectedDate,
      availableSlots: slot.maxSlots || 2,
      maxSlots: slot.maxSlots || 2
    }));
  }

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot = slot;
    this.booking.timeSlot = slot;
  }

  submitBooking() {
    if (!this.booking.customerName || !this.booking.customerMobile ||
        !this.booking.vehicleMake || !this.booking.vehicleModel ||
        !this.booking.vehicleRegistrationNumber || !this.booking.serviceType) {
      this.showNotificationMessage('Please fill in all required fields.');
      return;
    }

    // Validate mobile number: must be 10 digits and start with 6, 7, 8, or 9
    const phoneDigits = this.booking.customerMobile ? this.booking.customerMobile.replace(/\D/g, '') : '';
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phoneDigits)) {
      this.showNotificationMessage('Mobile number must be 10 digits and start with 6, 7, 8, or 9.');
      return;
    }

    if (!this.selectedTimeSlot) {
      this.showNotificationMessage('Please select a time slot.');
      return;
    }

    if (!this.currentUser?.id) {
      this.showNotificationMessage('Unable to create booking: missing user information. Please login again.');
      return;
    }

    // Keep local fields for UI
    this.booking.serviceBookingDate = this.selectedDate;
    this.booking.timeSlot = this.selectedTimeSlot;
    this.booking.userId = this.currentUser.id.toString();

    // Map frontend fields to the backend DTO shape
    const payload = {
      carCompany: this.booking.vehicleMake,
      carModel: this.booking.vehicleModel,
      serviceDate: this.selectedDate,
      timeSlot: this.selectedTimeSlot,
      selectedServices: this.booking.serviceType,
      otherProblem: this.booking.additionalInformation || null,
      status: 'PENDING'
    };

    // Log the booking payload being sent to the backend
    console.log('Submitting booking for user', this.currentUser.id, 'payload:', payload);

    this.bookingService.createBooking(payload, this.currentUser.id).subscribe({
      next: (res) => {
        console.log('Create booking response:', res);
        this.showNotificationMessage('Booking created successfully!');
        this.showBookingSuccessModal = true;
        setTimeout(() => this.closeBookingSuccessModal(), 2500);
        this.initializeBooking();
        this.activeView = 'dashboard';
        this.loadUserBookings();
      },
      error: (err) => {
        console.error(
          'Error creating booking (status, message, error body):',
          err?.status,
          err?.message,
          err?.error
        );
        this.showNotificationMessage(
          (err && err.error && (err.error.message || err.error.error)) ||
          err.message ||
          'Failed to create booking. Please try again.'
        );
      }
    });
  }

  openFeedbackModal() {
    this.feedback = {
      id: '',
      userId: this.currentUser?.id?.toString() || '',
      userName: `${this.currentUser?.fullName} ${this.currentUser?.lastName}`,
      rating: 0,
      category: 'Other',
      comments: '',
      createdAt: new Date()
    };
    this.showFeedbackModal = true;
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
  }

  setRating(rating: number) {
    this.feedback.rating = rating;
  }

  submitFeedback() {
    if (this.feedback.rating === 0) {
      this.showNotificationMessage('Please select a rating.');
      return;
    }

    this.feedbackService.submitFeedback(this.feedback).subscribe({
      next: () => {
        this.showNotificationMessage('Thank you for your feedback!');
        this.closeFeedbackModal();
      },
      error: (err) => {
        console.error('Error submitting feedback:', err);
        this.showNotificationMessage('Failed to submit feedback. Please try again.');
      }
    });
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

  closeBookingSuccessModal() {
    this.showBookingSuccessModal = false;
    // Refresh bookings when modal closes
    this.loadUserBookings();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    this.router.navigateByUrl('/');
  }
}


import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { FeedbackService } from '../../services/feedback-service';
import { SlotService } from '../../services/slot-service';
import { Booking } from '../../model/booking';
import { user } from '../../model/user';
import { Feedback } from '../../model/feedback';
import { SERVICE_OPTIONS } from '../../model/service';
import { TimeSlot, DEFAULT_TIME_SLOTS } from '../../model/slot';

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
  showProfileMenu: boolean = false;

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
  feedbackCategories = [
    'Service Quality',
    'Staff Behavior',
    'Pricing',
    'Timeliness',
    'Facility',
    'Other'
  ];

  // Notification
  notificationMessage: string = '';
  showNotification: boolean = false;

  // Booking success modal
  showBookingSuccessModal: boolean = false;

  // Interval id for auto-refreshing bookings
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

    this.loadUserBookings();
    this.startBookingsPolling();
    this.initializeBooking();

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    if (this.bookingsPollIntervalId) {
      clearInterval(this.bookingsPollIntervalId);
    }
  }

  // Notification method
  showNotificationMessage(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  initializeBooking(): void {
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

    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];

    this.loadAvailableSlots();
  }

  loadUserBookings(): void {
    if (this.currentUser?.id) {
      this.bookingService.getUserBookings(this.currentUser.id).subscribe({
        next: (bookings) => {
          let normalized = bookings.map((b: any) => {
            const rawStatus = (b.bookingStatus ?? b.status ?? 'PENDING').toString();

            return {
              ...b,
              status: rawStatus.toUpperCase(),
            } as Booking;
          });

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
            console.error(
              'Failed to read bookingStatusOverrides from localStorage',
              e
            );
          }

          this.userBookings = normalized;
          this.filterBookings();
        },

        error: (err) => {
          console.error('Error loading bookings:', err);
          this.userBookings = [];
          this.filterBookings();
        }
      });
    }
  }

  private startBookingsPolling(): void {
    if (this.bookingsPollIntervalId) {
      clearInterval(this.bookingsPollIntervalId);
    }

    this.bookingsPollIntervalId = setInterval(() => {
      this.loadUserBookings();
    }, 10000);
  }

  getBookingStatus(booking: Booking): string {
    return String(
      (booking as any).bookingStatus ?? booking.status ?? 'PENDING'
    )
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
  }

  getBookingStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'Booking Submitted',
      ACCEPTED: 'Confirmed',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'Service In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      REJECTED: 'Rejected'
    };

    return labels[status] || status.replace(/_/g, ' ');
  }

  getBookingProgress(status: string): number {
    const progress: { [key: string]: number } = {
      PENDING: 1,
      ACCEPTED: 2,
      CONFIRMED: 2,
      IN_PROGRESS: 3,
      COMPLETED: 4
    };

    return progress[status] || 0;
  }

  isBookingStepComplete(status: string, step: number): boolean {
    return this.getBookingProgress(status) >= step;
  }

  filterBookings(): void {
    this.filteredBookings = this.userBookings.filter(booking => {
      const serviceName = booking.serviceType || booking.selectedServices || '';

      const matchesService =
        this.selectedServiceFilter === 'All Services' ||
        serviceName === this.selectedServiceFilter;

      const matchesStatus =
        this.selectedStatusFilter === 'All Statuses' ||
        booking.status === this.selectedStatusFilter;

      const matchesSearch =
        !this.searchQuery ||
        (booking.customerName || booking.user?.fullName || '')
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        (booking.vehicleRegistrationNumber || booking.carModel || '')
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        serviceName.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesService && matchesStatus && matchesSearch;
    });
  }

  onServiceChange(): void {
    const selectedService = this.serviceOptions.find(
      s => s.name === this.booking.serviceType
    );

    if (selectedService) {
      this.booking.serviceCharge = selectedService.basePrice;
    }
  }

  onDateChange(): void {
    if (this.selectedDate) {
      this.booking.serviceBookingDate = this.selectedDate;
      this.loadAvailableSlots();
    }
  }

  loadAvailableSlots(): void {
    this.timeSlots = DEFAULT_TIME_SLOTS.map(slot => ({
      id: '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: this.selectedDate,
      availableSlots: slot.maxSlots || 2,
      maxSlots: slot.maxSlots || 2
    }));
  }

  selectTimeSlot(slot: string): void {
    this.selectedTimeSlot = slot;
    this.booking.timeSlot = slot;
  }

  submitBooking(): void {
    if (
      !this.booking.customerName ||
      !this.booking.customerMobile ||
      !this.booking.vehicleMake ||
      !this.booking.vehicleModel ||
      !this.booking.vehicleRegistrationNumber ||
      !this.booking.serviceType
    ) {
      this.showNotificationMessage('Please fill in all required fields.');
      return;
    }

    const phoneDigits = this.booking.customerMobile
      ? this.booking.customerMobile.replace(/\D/g, '')
      : '';

    const phoneRegex = /^[6-9][0-9]{9}$/;

    if (!phoneRegex.test(phoneDigits)) {
      this.showNotificationMessage(
        'Mobile number must be 10 digits and start with 6, 7, 8, or 9.'
      );
      return;
    }

    if (!this.selectedTimeSlot) {
      this.showNotificationMessage('Please select a time slot.');
      return;
    }

    if (!this.currentUser?.id) {
      this.showNotificationMessage(
        'Unable to create booking: missing user information. Please login again.'
      );
      return;
    }

    this.booking.serviceBookingDate = this.selectedDate;
    this.booking.timeSlot = this.selectedTimeSlot;
    this.booking.userId = this.currentUser.id.toString();

    const payload = {
      carCompany: this.booking.vehicleMake,
      carModel: this.booking.vehicleModel,
      serviceDate: this.selectedDate,
      timeSlot: this.selectedTimeSlot,
      selectedServices: this.booking.serviceType,
      otherProblem: this.booking.additionalInformation || null,
      status: 'PENDING'
    };

    console.log(
      'Submitting booking for user',
      this.currentUser.id,
      'payload:',
      payload
    );

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
          'Error creating booking:',
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

  // Feedback
  openFeedbackModal(): void {
    this.feedback = {
      id: '',
      userId: this.currentUser?.id?.toString() || '',
      userName: `${this.currentUser?.fullName || ''} ${this.currentUser?.lastName || ''}`.trim(),
      rating: 0,
      category: 'Other',
      comments: '',
      createdAt: new Date()
    };

    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
  }

  setRating(rating: number): void {
    this.feedback.rating = rating;
  }

  submitFeedback(): void {
    if (this.feedback.rating === 0) {
      this.showNotificationMessage('Please select a rating.');
      return;
    }

    const userStr = localStorage.getItem('user');

    if (!userStr) {
      this.showNotificationMessage('Please login first.');
      return;
    }

    const currentUser = JSON.parse(userStr);

    if (!currentUser.id) {
      console.error('User ID is missing:', currentUser);

      this.showNotificationMessage(
        'User information is missing. Please login again.'
      );
      return;
    }

    this.feedback.userId = String(currentUser.id);

    this.feedbackService
      .submitFeedback(this.feedback, String(currentUser.id))
      .subscribe({
        next: (response) => {
          console.log('Feedback submitted successfully:', response);

          this.showNotificationMessage('Thank you for your feedback!');
          this.closeFeedbackModal();
        },

        error: (err) => {
          console.error('Error submitting feedback:', err);

          this.showNotificationMessage(
            'Failed to submit feedback. Please try again.'
          );
        }
      });
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  closeBookingSuccessModal(): void {
    this.showBookingSuccessModal = false;
    this.loadUserBookings();
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    this.router.navigateByUrl('/');
  }
}

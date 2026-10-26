package com.example.demo.service;

import com.example.demo.model.Booking;

import java.util.List;

public interface BookingService {

    Booking createBooking(Booking booking, Long userId);

    List<Booking> getBookingsForUser(Long userId);

    List<Booking> getAllBookings();

    Booking updateStatus(Long bookingId, String status);
}

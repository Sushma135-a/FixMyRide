
package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/user/{userId}")
    public Booking createBooking(
            @PathVariable Long userId,
            @Valid @RequestBody Booking booking) {
        return bookingService.createBooking(booking, userId);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsForUser(@PathVariable Long userId) {
        return bookingService.getBookingsForUser(userId);
    }

    @GetMapping("/admin")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{bookingId}/status")
    public Booking updateStatus(
            @PathVariable Long bookingId,
            @RequestParam String status) {
        return bookingService.updateStatus(bookingId, status);
    }
}

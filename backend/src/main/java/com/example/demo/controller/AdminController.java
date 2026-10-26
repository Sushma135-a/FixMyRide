package com.example.demo.controller;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.model.Admin;
import com.example.demo.model.Booking;
import com.example.demo.service.AdminService;
import com.example.demo.service.BookingService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;
    private final BookingService bookingService;

    public AdminController(AdminService adminService, BookingService bookingService) {
        this.adminService = adminService;
        this.bookingService = bookingService;
    }

    @PostMapping("/login")
    public Admin login(@RequestBody Admin admin) {
    	System.out.println("admincontroller ");
    	System.out.println(admin);
         return adminService.login(admin.getUsername(), admin.getPassword());
     /*  if (a != null) {
            return "Login Successful";
       }
        return "Invalid Credentials";*/
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/bookings/{id}/status")
    public String updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        bookingService.updateStatus(id, status);
        return "Status updated";
    }
}
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { user } from '../../model/user';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {

user = new user();
confirmPassword = '';
success = '';
error = '';
  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.success = '';
    console.log('Register.submit called', { email: this.user.email });

    // Validate required fields
    if (!this.user.fullName || !this.user.lastName || !this.user.email ||
        !this.user.phone || !this.user.password || !this.confirmPassword) {
      this.error = 'Please fill in all required fields';
      return;
    }

    // Validate email format - allow any common email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    // Validate password match
    if (this.user.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Validate password length
    if (this.user.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }


    // Validate phone number: must be exactly 10 digits and start with 6, 7, 8, or 9
    const phoneDigits = this.user.phone ? this.user.phone.replace(/\D/g, '') : '';
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phoneDigits)) {
      this.error = 'Phone number must be 10 digits and start with 6, 7, 8, or 9';
      return;
    }

    console.log('Registering user:', this.user);

    this.authService.register(this.user).subscribe({
      next: () => {
        this.success = 'Registered successfully!';
        console.log('Registration successful');
      },
      error: (err) => {
        console.error('Registration error:', err);
        let errorMessage = 'Registration failed. Please try again.';

        if (err && err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          }
        } else if (err && err.message) {
          errorMessage = err.message;
        }

        const errorLower = errorMessage.toLowerCase();
        if (errorLower.includes('email') && (errorLower.includes('already') || errorLower.includes('exists'))) {
          errorMessage = 'This email is already registered. Please use a different email or login.';
        } else if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('failed')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and ensure the backend is running on http://localhost:3030';
        } else if (errorLower.includes('cors')) {
          errorMessage = 'CORS error. Please ensure the backend allows requests from this origin.';
        }

        this.error = errorMessage;
      },
      // Some servers may return a response that only completes without a JSON body.
      // Ensure navigation happens on successful completion (complete runs after next).
      complete: () => {
        if (!this.error) {
          console.log('Registration complete, navigating to /userlogin');
          this.router.navigate(['/userlogin']);
        }
      }
    });
  }
}

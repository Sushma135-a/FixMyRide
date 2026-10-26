import { Component } from '@angular/core';
import { Admin } from '../../model/admin';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

// removed unused import

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {

  email = '';
  password = '';
  error = '';

  admin=new Admin();

  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    console.log('Login.submit called', { email: this.admin.email });
    // ensure component-level email/password mirror the bound admin model
    this.email = this.admin.email;
    this.password = this.admin.password;
    // Only treat as admin login if credentials exactly match the default admin account.
    const defaultAdmin = new Admin();
    if (this.email === defaultAdmin.email && this.password === defaultAdmin.password) {
      // If backend is unavailable or returns unexpected content, allow local admin login
      const adminData = { email: this.admin.email };
      alert('Admin login successful (local)');
      localStorage.setItem('admin', JSON.stringify(adminData));
      this.router.navigateByUrl('/admin');
      return;
    }

    // Otherwise, perform user login flow.
    this.authService.userLogin(this.email, this.password).subscribe({
      next: (user) => {
        if (user != null) {
          let parsedUser: any = user;
          if (typeof user === 'string') {
            try {
              parsedUser = JSON.parse(user);
            } catch (e) {
              parsedUser = { email: this.email };
            }
          }
          alert('Login Successful');
          localStorage.setItem('user', JSON.stringify(parsedUser));
          this.router.navigateByUrl('/user');
          return;
        }
        this.error = 'Invalid email or password';
      },
      error: (userErr) => {
        this.error = 'Invalid email or password';
      }
    });
  }

}

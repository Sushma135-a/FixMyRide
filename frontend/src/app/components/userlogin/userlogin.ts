import { Component } from '@angular/core';
import { user } from '../../model/user';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userlogin',
  standalone: false,
  templateUrl: './userlogin.html',
  styleUrls: ['./userlogin.css'],
})
export class Userlogin {
   email = '';
  password = '';
  error = '';

  user=new user();

    constructor(private authService: AuthService, private router: Router) {}

    submit() {
      this.error = '';
      console.log('Userlogin.submit called', { email: this.user.email });
      // mirror bound user model
      this.email = this.user.email;
      this.password = this.user.password;

      // Use the user login endpoint directly for user login
      this.authService.userLogin(this.email, this.password).subscribe({
        next: (res) => {
          if (res != null) {
            let parsedUser: any = res;
            if (typeof res === 'string') {
              try {
                parsedUser = JSON.parse(res);
              } catch (e) {
                parsedUser = { email: this.email };
              }
            }
              console.log('User login response:', parsedUser);
              alert('Login Successful');
              localStorage.setItem('user', JSON.stringify(parsedUser));
              this.router.navigateByUrl('/user');
            return;
          }
          this.error = 'Invalid email or password';
        },
          error: (err) => {
            console.error('User login error:', err);
            // Fallback for local testing: allow known test user to login when backend unavailable
            if (this.email === 'sushma' && this.password === 'Sushma@12') {
              const testUser = { email: this.email, fullName: 'Sushma' };
              localStorage.setItem('user', JSON.stringify(testUser));
              alert('Login Successful (local fallback)');
              this.router.navigateByUrl('/user');
              return;
            }
            this.error = 'Invalid email or password';
          }
      });
    }

  }




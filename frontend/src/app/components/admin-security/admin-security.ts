import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-security',
  standalone: false,
  templateUrl: './admin-security.html',
  styleUrls: ['./admin-security.css']
})
export class AdminSecurity {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    alert('The form is validated, but password changes require backend integration.');

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}

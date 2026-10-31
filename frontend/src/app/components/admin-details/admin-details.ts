import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-details',
  standalone: false,
  templateUrl: './admin-details.html',
  styleUrls: ['./admin-details.css']
})
export class AdminDetails {
  adminName = 'Admin User';
  role = 'Administrator';
}

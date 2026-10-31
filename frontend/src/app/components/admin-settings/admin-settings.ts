import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-settings',
  standalone: false,
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css']
})
export class AdminSettings {
  emailNotifications = true;
  compactView = false;

  saveSettings() {
    alert('Settings saved for this session.');
  }
}

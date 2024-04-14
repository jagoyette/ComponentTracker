import { Component, OnInit } from '@angular/core';
import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit{
  
  constructor (private apiService: ComponentTrackerApiService) {}

  public user: User | null = null;

  ngOnInit(): void {
    // Retrieve the currently logged in user
    this.apiService.getCurrentUser().subscribe(data => {
      this.user = data;
      console.log('Current user', this.user);
    });
  }

  logout(): void {
    this.apiService.logout().subscribe(result => {
      if (result?.success) {
        this.user = null;
      }
    });
  }
}

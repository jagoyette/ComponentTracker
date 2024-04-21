import { Component, OnInit } from '@angular/core';
import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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
  public stravaIntegrationUrl: String | null = null;

  ngOnInit(): void {
    // Retrieve the currently logged in user
    this.apiService.getCurrentUser().subscribe(data => {
      this.user = data;
      console.log('Current user', this.user);
    });

    // Build the strava integration url
    const origin = window.location.origin;

    // Add success and failure redirects to the url
    const successUrl = `${origin}/strava/success`;
    const failureUrl = `${origin}/strava/failure`;
    this.stravaIntegrationUrl = `${environment.API_SERVER_URL}auth/strava/integrate?successRedirect=${successUrl}&failureRedirect=${failureUrl}`;
  }

  logout(): void {
    this.apiService.logout().subscribe(result => {
      if (result?.success) {
        this.user = null;
      }
    });
  }

  checkStravaIntegration(): void {
    this.apiService.checkStravaIntegration().subscribe(result => {
      console.log('Strava Integration Result: ', result);
    })
  }

  refreshMyToken() : void {
    this.apiService.refreshToken().subscribe(result => {
      console.log('Refresh Result: ', result);
    }) 
  }

  syncronizeStravaRides() : void {
    this.apiService.synchronizeStravaRides().subscribe(result => {
      console.log('Sync results: ', result);
    });
  }
}

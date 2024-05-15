import { Component, OnInit } from '@angular/core';
import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit{
  
  constructor (private apiService: ComponentTrackerApiService) {}

  public user: User | null = null;
  public rideStats: any | null = null;
  public stravaUser: any | null = null;
  public stravaIntegrationUrl: String | null = null;
  public rwgpsUser: any | null = null;
  public rwgpsIntegrationUrl: String | null = null;

  ngOnInit(): void {
    // Retrieve the currently logged in user
    this.apiService.getCurrentUser().subscribe(data => {
      this.user = data;
      console.log('Current user', this.user);
    });

    // Check for current strava user
    this.apiService.getStravaAthlete().subscribe(data => {
      this.stravaUser = data;
      console.log('Strava User', this.stravaUser);
    }, err => {
      console.log('No Strava Integration');
    });
 
    this.apiService.getRwgpsAthlete().subscribe(data => {
      this.rwgpsUser = data;
      console.log('RWGPS User', this.rwgpsUser);
    }, err => {
      console.log('No RWGPS Integration');
    });

    // Get user's stats
    this.updateRideStats();

    // Build the strava integration url
    const origin = window.location.origin;

    // Add success and failure redirects to the url
    const successUrl = `${origin}/profile`;
    const failureUrl = `${origin}/strava/failure`;
    this.stravaIntegrationUrl = `${environment.API_SERVER_URL}auth/strava/integrate?successRedirect=${successUrl}&failureRedirect=${failureUrl}`;
    this.rwgpsIntegrationUrl = `${environment.API_SERVER_URL}auth/rwgps/integrate?successRedirect=${origin}/profile&failureRedirect=${origin}/rwgps/failure`;
  }

  logout(): void {
    this.apiService.logout().subscribe(result => {
      if (result?.success) {
        this.user = null;
      }
    });
  }

  updateRideStats(): void {
    this.apiService.getRideStats().subscribe(data => {
      this.rideStats = data;
      console.log(data);
    });
  }
  
  disconnectStrava(): void {
    this.apiService.deleteStravaAthlete().subscribe(result => {
      console.log(result);
      this.stravaUser = null;
      this.rideStats = null;
    })
  };

  syncronizeStravaRides() : void {
    this.apiService.synchronizeStravaRides().subscribe(result => {
      console.log('Sync results: ', result);
    });
  }

  disconnectRwgps(): void {
    this.apiService.deleteRwgpsAthlete().subscribe(result => {
      console.log(result);
      this.rwgpsUser = null;
    })
  };

  syncronizeRwgpsRides() : void {
    this.apiService.synchronizeRwgpsRides().subscribe(result => {
      console.log('Sync results: ', result);
    });
  }
}

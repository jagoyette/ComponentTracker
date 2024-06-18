import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit{
  
  constructor (private apiService: ComponentTrackerApiService, private authService: AuthService, private router: Router,
    private activeRoute: ActivatedRoute, private cookieService: CookieService) {}

  public user: User | null = null;
  public rideStats: any | null = null;
  public stravaUser: any | null = null;
  public rwgpsUser: any | null = null;

  ngOnInit(): void {
    // Retrieve the currently logged in user
    this.authService.getCurrentUser().subscribe(data => {
      this.user = data;
      console.log('Current user', this.user);
    }, err => {
      console.log('Not logged in');
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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['home']);
  }

  integrateStrava(): void {
    const origin = window.location.origin;
    const successUrl = `${origin}/integration/result?provider=strava&result=success&return=profile`;
    const failureUrl = `${origin}/integration/result?provider=strava&result=failure&return=profile`;
    const appState = this.authService.createApplicationState();
    const appStateCookieName = this.authService.APP_STATE_COOKIE_NAME;
    this.apiService.integrateStrava(successUrl, failureUrl, appState, appStateCookieName).subscribe(data => {
      console.log('Starting Strava OAuth workflow');
      if (data.url) {
        window.location.href = data.url;
      }
    });
  }

  integrateRwgps(): void {
    const origin = window.location.origin;
    const successUrl = `${origin}/integration/result?provider=rwgps&result=success&return=profile`;
    const failureUrl = `${origin}/integration/result?provider=rwgps&result=failure&return=profile`;
    const appState = this.authService.createApplicationState();
    const appStateCookieName = this.authService.APP_STATE_COOKIE_NAME;
    this.apiService.integrateRwgps(successUrl, failureUrl, appState, appStateCookieName).subscribe(data => {
      console.log('Starting RWGPS OAuth workflow');
      if (data.url) {
        window.location.href = data.url;
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

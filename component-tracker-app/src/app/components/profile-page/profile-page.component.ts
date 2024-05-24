import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { ComponentTrackerApiService } from '../../services/component-tracker-api.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit{
  
  constructor (private apiService: ComponentTrackerApiService, private authService: AuthService, private router: Router,
    private activeRoute: ActivatedRoute, private cookieService: CookieService) {}

  public user: User | null = null;
  public rideStats: any | null = null;
  public stravaUser: any | null = null;
  public rwgpsUser: any | null = null;

  ngOnInit(): void {
    // check if this component is loaded in response to an integration result
    this.activeRoute.queryParamMap.subscribe(params => {
      const result = params.get('result');
      const provider = params.get('provider');
      if (result) {
        const appStateString = this.cookieService.get('appState');
        const appState = JSON.parse(appStateString);
        if (appState) {
          console.log(`Restoring application state after integration. Result = ${result}, Provider = ${provider}`);
          this.authService.accessToken = appState;
        }
      }
    });

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
    this.authService.logout().subscribe(result => {
      if (result?.success) {
        this.user = null;
      }
    });
  }

  integrateStrava(): void {
    const origin = window.location.origin;
    const successUrl = `${origin}/profile?provider=strava&result=success`;
    const failureUrl = `${origin}/profile?provider=strava&result=failure`;
    const appState = JSON.stringify(this.authService.accessToken);
    this.authService.integrateStrava(successUrl, failureUrl, appState).subscribe(data => {
      console.log('Starting Strava OAuth workflow');
      if (data.url) {
        window.location.href = data.url;
      }
    });
  }

  integrateRwgps(): void {
    const origin = window.location.origin;
    const successUrl = `${origin}/profile?provider=rwgps&result=success`;
    const failureUrl = `${origin}/profile?provider=rwgps&result=failure`;
    const appState = JSON.stringify(this.authService.accessToken);
    this.authService.integrateRwgps(successUrl, failureUrl, appState).subscribe(data => {
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

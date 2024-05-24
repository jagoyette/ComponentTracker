import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-integration-result',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './integration-result.component.html',
  styleUrl: './integration-result.component.css'
})
export class IntegrationResultComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router,
    private activeRoute: ActivatedRoute, private cookieService: CookieService) {}

    ngOnInit(): void {
      // this component should be called upon completion of an OAuth
      // workflow used to connect to an external account (Strava, RWGPS, etc...)
      // We are not expected to hang out here long. We opnly need to restore
      // our own application state and re-route as desired.

      // Always try to restore our application state
      try {
        const appStateString = this.cookieService.get('appState');
        const appState = JSON.parse(appStateString);
        if (appState) {
          console.log(`Restoring application state...`);
          this.authService.accessToken = appState;
        }
      } catch (error) {
        console.log('Unable to restore application state!');
      }

      // Inspect query parameters to determine how to redirect
      this.activeRoute.queryParamMap.subscribe(params => {
        const result = params.get('result');
        const provider = params.get('provider');
        console.log(`Integration with provider ${provider} resulted in ${result}`);

        // Re-route to desired page
        const returnTo = params.get('return') || 
          this.authService.isLoggedIn() ? 'profile' : 'home';

        this.router.navigate([returnTo])
          .catch(reason => this.router.navigateByUrl('/'));   // navigate to root on error
      });
    }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { AccessToken } from '../models/access-token';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private cookieService: CookieService) {}
  
  public readonly baseUrl = environment.API_SERVER_URL || '/';
  public user: User | null | undefined;
  public accessToken: AccessToken | null | undefined;

  // Application State Tracking for OAuth integrations
  public readonly APP_STATE_COOKIE_NAME = 'ctas';
  
  /**
   * Creates an string representing our current authentication state.
   * Intended to be encoded in our local AppState database and restored
   * when the OAuth workflow completes.
   */
  public createApplicationState(): string {
    if (!this.isLoggedIn()) {
      return '';
    }

    // Stringify and Base64 encode the accessToken object
    const appState = JSON.stringify(this.accessToken);
    return btoa(appState);
  }

  /**
   * Restores application state from cookie following OAuth integration.
   * This method is intended to be called from the redirect component
   * handling the result of the OAuth workflow. The application state
   * is encoded in a cookie in this redirect page. Calling this method
   * will restore the apllication state (authentication info) and delete
   * the cookie.
   */
  public restoreApplicationState(): void {
    // Read and remove our app state cookie immediately
    const appStateString = this.cookieService.get(this.APP_STATE_COOKIE_NAME);
    this.cookieService.delete(this.APP_STATE_COOKIE_NAME, '/', window?.location?.hostname);

    try {
      // Decode the Base64 data and parse resulting string
      const jsonString = atob(appStateString);
      const appState = JSON.parse(jsonString);
      if (appState) {
        console.log(`Restoring application state...`);
        // We are currently storing only the accessToken object
        this.accessToken = appState;
      }
    } catch (error) {
      console.log('Error trying to restore application state', error);
    }
  }

  getCurrentUser(): Observable<User> {
    const url = this.baseUrl + 'auth/user'
    return this.http.get<User>(url).pipe(
      tap(user => this.user = user)
    );
  }

  isLoggedIn(): boolean {
    return !!(this.accessToken?.token);
  }

  logout(): void {
    // We do not need to make a server call because the API service is stateless
    // Simply remove our access token, and we will be logged out
    this.accessToken = this.user = null;
  }

  /**
   * Create a URL to initiate user login via Google OAuth.
   * 
   * @param successPath     The URL to redirect to following successful login
   * @param failurePath     The URL to redirect to following unsuccessful login
   * @returns  {string}     A URL that should be loaded into a browser window to initiate login workflow.       
   */
  createGoogleLoginUrl(successPath: string, failurePath: string): string {
    // Build the login url
    const origin = window.location.origin;

    // Add success and failure redirects to the login url
    const successUrl = `${origin}${successPath}`;
    const failureUrl = `${origin}${failurePath}`;
    return`${this.baseUrl}auth/google/login?successRedirect=${successUrl}&failureRedirect=${failureUrl}`;
  }

}

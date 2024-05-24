import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { AccessToken } from '../models/access-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}
  
  public readonly baseUrl = environment.API_SERVER_URL || '/';
  public user: User | null | undefined;
  public accessToken: AccessToken | null | undefined;

  getCurrentUser(): Observable<User> {
    const url = this.baseUrl + 'auth/user'
    return this.http.get<User>(url).pipe(
      tap(user => this.user = user)
    );
  }

  isLoggedIn(): boolean {
    return !!(this.accessToken?.token);
  }

  logout(): Observable<any> {
    const url = this.baseUrl + 'auth/logout'
    return this.http.post(url, null);
  }

  createGoogleLoginUrl(successPath: string, failurePath: string): string {
    // Build the login url
    const origin = window.location.origin;

    // Add success and failure redirects to the login url
    const successUrl = `${origin}${successPath}`;
    const failureUrl = `${origin}${failurePath}`;
    return`${this.baseUrl}auth/google/login?successRedirect=${successUrl}&failureRedirect=${failureUrl}`;
  }

  integrateStrava(successRedirect: string, failureRedirect: string, appState: string, appStateCookieName: string = 'appState'): Observable<any> {
    const url = this.baseUrl + 'auth/strava/integrate';
    return this.http.post(url, {
      successRedirect,
      failureRedirect,
      appState,
      appStateCookieName
    });
  }

  integrateRwgps(successRedirect: string, failureRedirect: string, appState: string, appStateCookieName: string = 'appState'): Observable<any> {
    const url = this.baseUrl + 'auth/rwgps/integrate';
    return this.http.post(url, {
      successRedirect,
      failureRedirect,
      appState,
      appStateCookieName
    });
  }

}

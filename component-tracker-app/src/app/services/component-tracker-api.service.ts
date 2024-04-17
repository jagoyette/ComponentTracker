import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ComponentTrackerApiService {

  constructor(private http: HttpClient) { }

  private readonly baseUrl = environment.API_SERVER_URL || '/';

  getCurrentUser(): Observable<User> {
    const url = this.baseUrl + 'auth/user'
    return this.http.get<User>(url);
  }

  logout(): Observable<any> {
    const url = this.baseUrl + 'auth/logout'
    return this.http.post(url, null);
  }

  checkStravaIntegration(): Observable<any> {
    const url = this.baseUrl + 'auth/strava/integration'
    return this.http.post(url, null);
  }
}

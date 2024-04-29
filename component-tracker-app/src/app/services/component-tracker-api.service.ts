import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ComponentTrackerApiService {

  constructor(private http: HttpClient) {
    console.log('Api Service Url: ' + this.baseUrl);
   }

  private readonly baseUrl = environment.API_SERVER_URL || '/';

  getCurrentUser(): Observable<User> {
    const url = this.baseUrl + 'auth/user'
    return this.http.get<User>(url);
  }

  logout(): Observable<any> {
    const url = this.baseUrl + 'auth/logout'
    return this.http.post(url, null);
  }

  getStravaAthlete(): Observable<any> {
    const url = this.baseUrl + 'strava/athlete'
    return this.http.get(url);
  }

 deleteStravaAthlete(): Observable<any> {
    const url = this.baseUrl + 'strava/athlete'
    return this.http.delete(url);
  }

  getStravaStats(): Observable<any> {
    const url = this.baseUrl + 'strava/statistics'
    return this.http.get(url);
  }

  synchronizeStravaRides(): Observable<any> {
    const url = this.baseUrl + 'strava/synchronize'
    return this.http.post(url, null);
  }
}

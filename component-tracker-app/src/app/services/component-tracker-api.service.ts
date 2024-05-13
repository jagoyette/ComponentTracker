import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { ComponentModel } from '../models/component-model';

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

  getRideStats(): Observable<any> {
    const url = this.baseUrl + 'ride/statistics'
    return this.http.get(url);
  }

  /*************************************************************************
   * Strava API
   */
  getStravaAthlete(): Observable<any> {
    const url = this.baseUrl + 'strava/athlete'
    return this.http.get(url);
  }

 deleteStravaAthlete(): Observable<any> {
    const url = this.baseUrl + 'strava/athlete'
    return this.http.delete(url);
  }

  synchronizeStravaRides(): Observable<any> {
    const url = this.baseUrl + 'strava/synchronize'
    return this.http.post(url, null);
  }

  /***************************************************************************
   * Ride with GPS API
   */
  getRwgpsAthlete(): Observable<any> {
    const url = this.baseUrl + 'rwgps/athlete'
    return this.http.get(url);
  }

 deleteRwgpsAthlete(): Observable<any> {
    const url = this.baseUrl + 'rwgps/athlete'
    return this.http.delete(url);
  }

  synchronizeRwgpsRides(): Observable<any> {
    const url = this.baseUrl + 'rwgps/synchronize'
    return this.http.post(url, null);
  }

  /*******************************************************************
   * Component API
   * 
   */

  getMyComponents(): Observable<ComponentModel[]> {
    const url = this.baseUrl + 'component';
    return this.http.get<ComponentModel[]>(url);
  }

  createComponent(componentData: any): Observable<ComponentModel> {
    const url = this.baseUrl + 'component';
    return this.http.post<ComponentModel>(url, componentData);
  }

  getComponent(componentId: String): Observable<ComponentModel> {
    const url = this.baseUrl + 'component/' + componentId;
    return this.http.get<ComponentModel>(url);
  }

  deleteComponent(componentId: String): Observable<ComponentModel> {
    const url = this.baseUrl + 'component/' + componentId;
    return this.http.delete<ComponentModel>(url);
  }

  updateComponent(componentId: String, componentData: any): Observable<ComponentModel> {
    const url = this.baseUrl + 'component/' + componentId;
    return this.http.put<ComponentModel>(url, componentData);
  }

  synchronizeComponentRides(componentId: String): Observable<ComponentModel> {
    const url = this.baseUrl + 'component/' + componentId + '/sync';
    return this.http.post<ComponentModel>(url, null);
  }
}

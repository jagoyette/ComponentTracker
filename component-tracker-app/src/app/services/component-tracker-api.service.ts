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

  private readonly baseUrl = environment.API_SERVER_URL || '/api/';



  getRideStats(): Observable<any> {
    const url = this.baseUrl + 'ride/statistics'
    return this.http.get(url);
  }

  /*************************************************************************
   * Strava API
   */

  /**
   * Integrate the current user with Strava.
   * The object returned will contain a property called `url`. This URL should be loaded into
   * a browser window to initiate an OAuth workflow. The user may be required to interact 
   * and authorize the application. The OAuth worlfow concludes be redirecting the browser to
   * either the `successRedirect` or the `failureRedirect` urls supplied.
   * 
   * If the workflow is conducted in the same window (tab) as the current application, the
   * current user authentication info may be lost. You may save the application state by
   * encoding authentication or other info in the `appState` property. This information will
   * be made available in a cookie following the OAuth redirects. See `AuthService` for state
   * encoding and restoration methods.
   * 
   * @param {string} successRedirect  The URL to redirect to following successful login
   * @param {string} failureRedirect  The URL to redirect to following unsuccessful login
   * @param {string} appState         String representing current application state
   * @param {string} appStateCookieName The name of the cookie which will hold the appState after redirects
   * @returns {object}                An object representing the integration info. 
   * The `url` property contains the URL that should be loaded into a browser window to initiate OAuth workflow.
   */
  integrateStrava(successRedirect: string, failureRedirect: string, appState: string, appStateCookieName: string): Observable<any> {
    const url = this.baseUrl + 'strava/integrate';
    return this.http.post(url, {
      successRedirect,
      failureRedirect,
      appState,
      appStateCookieName
    });
  }

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
  
  /**
   * Integrate the current user with Ride with GPS.
   * The object returned will contain a property called `url`. This URl should be loaded into
   * the user's browser window to initiate an OAuth workflow. The user may be required to interact 
   * and authorize the application. The OAuth worlfow concludes be redirecting the browser to
   * either the `successRedirect` or the `failureRedirect` urls supplied.
   * 
   * If the workflow is conducted in the same window (tab) as the current application, the
   * current user authentication info may be lost. You may restore the application state by
   * encoding authentication or other info in the `appState` property. This information will
   * be made available in a cookie following the OAuth redirects.
   * 
   * @param {string} successRedirect  The URL to redirect to following successful login
   * @param {string} failureRedirect  The URL to redirect to following unsuccessful login
   * @param {string} appState         String representing current application state
   * @param {string} appStateCookieName The name of the cookie which will hold the appState after redirects
   * @returns {object}                An object representing the integration info. 
   * The `url` property contains the URL that should be loaded into a browser window to initiate OAuth workflow.
   */
  integrateRwgps(successRedirect: string, failureRedirect: string, appState: string, appStateCookieName: string): Observable<any> {
    const url = this.baseUrl + 'rwgps/integrate';
    return this.http.post(url, {
      successRedirect,
      failureRedirect,
      appState,
      appStateCookieName
    });
  }
  
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

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  
  private readonly baseUrl = environment.API_SERVER_URL || '/';

  getCurrentUser(): Observable<User> {
    const url = this.baseUrl + 'auth/user'
    return this.http.get<User>(url);
  }

  getLoginUrl(): string {
    // Build the login url
    const origin = window.location.origin;

    // Add success and failure redirects to the login url
    const successUrl = `${origin}/home`;
    const failureUrl = `${origin}/login`;
    return `${this.baseUrl}auth/google/login?successRedirect=${successUrl}&failureRedirect=${failureUrl}`;
  }

  logout(): Observable<any> {
    const url = this.baseUrl + 'auth/logout'
    return this.http.post(url, null);
  }
}

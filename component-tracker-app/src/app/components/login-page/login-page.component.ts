import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  constructor() {}

  public loginUrl: string = "";

  ngOnInit(): void {
    // Build the login url
    const origin = window.location.origin;
    this.loginUrl = `${environment.API_SERVER_URL}auth/google/login?returnTo=${origin}/home`;
  }
}

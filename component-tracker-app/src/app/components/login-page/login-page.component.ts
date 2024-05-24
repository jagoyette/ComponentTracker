import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router,
    private activeRoute: ActivatedRoute, private cookieService: CookieService) {}

  ngOnInit(): void {
    // check if this component is loaded in response to a login result
    this.activeRoute.queryParamMap.subscribe(params => {
      const result = params.get('result');
      if (result === 'success') {
        // successfully logged in
        const access_token_str = this.cookieService.get('access_token');
        const access_token = JSON.parse(access_token_str);
        if (access_token) {
          console.log('User login successful');
          this.authService.accessToken = access_token;
        }
        
        // redirect to Home
        this.router.navigate(["/home"]);
      }
    });
  }

  public login(): void {
    // Get the URL to start Google login workflow
    const url = this.authService.createGoogleLoginUrl("/login?result=success", "/login?resut=failure");

    // load login page directly (not an Angular route)
    window.location.href = url;
  };
}

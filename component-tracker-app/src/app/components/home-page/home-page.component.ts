import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {

  constructor (private authService: AuthService) {}

  public user: User | null = null;

  ngOnInit(): void {
    // Retrieve the currently logged in user
    this.authService.getCurrentUser().subscribe(data => {
      this.user = data;
      console.log('Current user', this.user);
    }, error => {
      console.log('Not logged in');
    });
  }
}

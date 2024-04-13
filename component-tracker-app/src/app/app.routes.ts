import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';

export const routes: Routes = [
    { path: "", component: HomePageComponent },
    { path: "home", component: HomePageComponent },
    { path: "login", component: LoginPageComponent },

    // Wildcards and redirect routes
    { path: '', redirectTo: '/', pathMatch: 'full' },
];

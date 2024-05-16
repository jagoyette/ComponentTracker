import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { ComponentsPageComponent } from './components/components-page/components-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: "home", component: HomePageComponent },
    { path: "login", component: LoginPageComponent },
    { path: "profile", component: ProfilePageComponent, canActivate: [authGuard] },
    { path: "components", component: ComponentsPageComponent, canActivate: [authGuard] },

    // Wildcards and redirect routes
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundComponent }
];

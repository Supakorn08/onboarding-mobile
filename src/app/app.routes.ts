import { Routes } from '@angular/router';
import { OnboardingLayout } from './layouts/onboarding-layout/onboarding-layout';
import { flowGuard } from './guards/flow.guard';

export const appRoutes: Routes = [
  { path: '', component: OnboardingLayout, children: [
    { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing) },
    { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
    { path: 'otp', canActivate: [flowGuard('otp')], loadComponent: () => import('./pages/otp/otp').then(m => m.Otp) },
    { path: 'terms', canActivate: [flowGuard('terms')], loadComponent: () => import('./pages/terms/terms').then(m => m.Terms) },
    { path: 'success', canActivate: [flowGuard('success')], loadComponent: () => import('./pages/success/success').then(m => m.Success) },
  ]},
  { path: '**', redirectTo: '' },
];

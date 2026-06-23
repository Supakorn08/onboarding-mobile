import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandBackdrop } from '../../components/brand-backdrop/brand-backdrop';

@Component({
  selector: 'app-onboarding-layout',
  standalone: true,
  imports: [RouterOutlet, BrandBackdrop],
  templateUrl: './onboarding-layout.html',
  styleUrl: './onboarding-layout.scss',
})
export class OnboardingLayout {}

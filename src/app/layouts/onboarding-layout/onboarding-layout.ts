import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandBackdrop } from '../../components/brand-backdrop/brand-backdrop';
import { MockTriggerHint } from '../../components/mock-trigger-hint/mock-trigger-hint';

@Component({
  selector: 'app-onboarding-layout',
  standalone: true,
  imports: [RouterOutlet, BrandBackdrop, MockTriggerHint],
  templateUrl: './onboarding-layout.html',
  styleUrl: './onboarding-layout.scss',
})
export class OnboardingLayout {}

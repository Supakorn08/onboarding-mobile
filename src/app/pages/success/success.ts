import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, TitleComponent, IconComponent } from '@exim/ui-kit';
import { OnboardingFlowState } from '../../state/onboarding-flow.state';
import { SUCCESS_MESSAGES } from './success.message';
import { SUCCESS_SELECTORS } from './success.selector';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [ButtonComponent, TitleComponent, IconComponent],
  templateUrl: './success.html',
  styleUrl: './success.scss',
})
export class Success {
  protected readonly msg = SUCCESS_MESSAGES;
  protected readonly sel = SUCCESS_SELECTORS;

  protected readonly flowState = inject(OnboardingFlowState);
  private readonly router = inject(Router);

  finish(): void {
    this.flowState.reset();
    this.router.navigate(['/']);
  }
}

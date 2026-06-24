import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SubscriptionService } from '../../services/onboarding-service/subscription/subscription.service';
import { OnboardingFlowState } from '../../state/onboarding-flow.state';

@Injectable()
export class TermsState {
  private readonly service = inject(SubscriptionService);
  private readonly flow = inject(OnboardingFlowState);
  private readonly router = inject(Router);

  readonly scrolledToBottom = signal(false);
  readonly isLoading = signal(false);

  markScrolledToBottom(): void {
    this.scrolledToBottom.set(true);
  }

  async accept(): Promise<void> {
    if (!this.scrolledToBottom() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    try {
      await firstValueFrom(this.service.subscribe());
      this.flow.markSubscribed();
      this.router.navigate(['/success']);
    } finally {
      this.isLoading.set(false);
    }
  }
}

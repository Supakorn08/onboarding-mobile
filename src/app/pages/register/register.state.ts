import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SubscriptionService } from '../../services/onboarding-service/subscription/subscription.service';
import { EligibilityFailure } from '../../services/onboarding-service/subscription/subscription.model';
import { OnboardingFlowState } from '../../state/onboarding-flow.state';
import { isValidEmail, isValidJuristicId } from '../../shared/utils/validators';
import { REGISTER_MESSAGES } from './register.message';

@Injectable()
export class RegisterState {
  private readonly service = inject(SubscriptionService);
  private readonly flow = inject(OnboardingFlowState);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly juristicId = signal('');
  readonly emailError = signal<string | null>(null);
  readonly idError = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly modal = signal<'none' | 'not-found' | 'not-linked'>('none');

  async submit(): Promise<void> {
    this.emailError.set(null);
    this.idError.set(null);

    let hasError = false;
    if (!isValidEmail(this.email())) {
      this.emailError.set(REGISTER_MESSAGES.errors.emailFormat);
      hasError = true;
    }
    if (!isValidJuristicId(this.juristicId())) {
      this.idError.set(REGISTER_MESSAGES.errors.idIncomplete);
      hasError = true;
    }
    if (hasError) return;

    this.isLoading.set(true);
    try {
      const r = await firstValueFrom(
        this.service.verifyEligibility({ email: this.email(), juristicId: this.juristicId() })
      );

      if (r.data?.eligible) {
        const o = await firstValueFrom(this.service.requestOtp(this.email()));
        this.flow.setIdentity(this.email(), this.juristicId());
        this.flow.setOtpRef(o.data!.ref);
        this.router.navigate(['/otp']);
      } else {
        switch (r.data?.failure) {
          case EligibilityFailure.EmailNotFound:
            this.emailError.set(REGISTER_MESSAGES.errors.emailNotFound);
            break;
          case EligibilityFailure.JuristicNotFound:
            this.idError.set(REGISTER_MESSAGES.errors.juristicNotFound);
            break;
          case EligibilityFailure.BothInvalid:
            this.emailError.set(REGISTER_MESSAGES.errors.bothEmail);
            this.idError.set(REGISTER_MESSAGES.errors.bothId);
            break;
          case EligibilityFailure.NoMatch:
            this.modal.set('not-found');
            break;
          case EligibilityFailure.EmailNotLinked:
            this.modal.set('not-linked');
            break;
        }
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal(): void {
    this.modal.set('none');
  }
}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OnboardingFlowState } from '../state/onboarding-flow.state';

type Step = 'register' | 'otp' | 'terms' | 'success';
export function flowGuard(step: Step): CanActivateFn {
  return () => {
    const s = inject(OnboardingFlowState);
    const router = inject(Router);
    const ok =
      step === 'register' ? true :
      step === 'otp' ? !!s.email() && !!s.otpRef() :
      step === 'terms' ? s.otpVerified() :
      /* success */ s.subscribed();
    return ok ? true : router.createUrlTree(['/']);
  };
}

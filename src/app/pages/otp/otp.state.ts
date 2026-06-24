import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import { SubscriptionService } from '../../services/onboarding-service/subscription/subscription.service';
import { OnboardingFlowState } from '../../state/onboarding-flow.state';
import { OtpFailure } from '../../services/onboarding-service/subscription/subscription.model';
import { OTP_MESSAGES } from './otp.message';

@Injectable()
export class OtpState {
  private readonly service = inject(SubscriptionService);
  private readonly flow = inject(OnboardingFlowState);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly email = this.flow.email;
  readonly otpRef = this.flow.otpRef;

  readonly code = signal('');
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly exceededModal = signal(false);
  readonly remainingTime = signal(0);
  readonly canResend = computed(() => this.remainingTime() === 0);
  readonly fieldState = computed<'default' | 'error'>(() => (this.error() ? 'error' : 'default'));

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCooldown();
    this.destroyRef.onDestroy(() => this.clearCountdown());
  }

  private clearCountdown(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startCooldown(): void {
    this.clearCountdown();
    this.remainingTime.set(environment.otpConfig.otpRequestCooldownSeconds);
    this.intervalId = setInterval(() => {
      const next = this.remainingTime() - 1;
      this.remainingTime.set(next > 0 ? next : 0);
      if (next <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }

  async verify(): Promise<void> {
    if (this.code().length !== 8 || this.isLoading()) {
      return;
    }
    this.error.set(null);
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.service.verifyOtp({ ref: this.otpRef(), code: this.code() }));
      if (res.data?.verified) {
        this.flow.markOtpVerified();
        this.router.navigate(['/terms']);
        return;
      }
      switch (res.data?.failure) {
        case OtpFailure.Incorrect:
          this.error.set(OTP_MESSAGES.errorIncorrect(res.data.remainingAttempts ?? 0));
          break;
        case OtpFailure.Expired:
          this.error.set(OTP_MESSAGES.errorExpired);
          break;
        case OtpFailure.Exceeded:
          this.exceededModal.set(true);
          break;
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async resend(): Promise<void> {
    if (!this.canResend()) {
      return;
    }
    await firstValueFrom(this.service.requestOtp(this.email()));
    this.code.set('');
    this.error.set(null);
    this.startCooldown();
  }

  backToRegister(): void {
    this.exceededModal.set(false);
    this.router.navigate(['/register']);
  }
}

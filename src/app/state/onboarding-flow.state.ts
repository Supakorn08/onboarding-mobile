import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class OnboardingFlowState {
  readonly email = signal('');
  readonly juristicId = signal('');
  readonly otpRef = signal('');
  readonly otpVerified = signal(false);
  readonly subscribed = signal(false);
  setIdentity(email: string, juristicId: string) { this.email.set(email); this.juristicId.set(juristicId); }
  setOtpRef(ref: string) { this.otpRef.set(ref); }
  markOtpVerified() { this.otpVerified.set(true); }
  markSubscribed() { this.subscribed.set(true); }
  reset() { this.email.set(''); this.juristicId.set(''); this.otpRef.set(''); this.otpVerified.set(false); this.subscribed.set(false); }
}

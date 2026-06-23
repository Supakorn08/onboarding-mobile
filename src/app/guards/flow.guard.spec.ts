import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { flowGuard } from './flow.guard';
import { OnboardingFlowState } from '../state/onboarding-flow.state';

describe('flowGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  it('redirects to / when otp precondition missing', () => {
    const res = TestBed.runInInjectionContext(() => flowGuard('otp')({} as any, {} as any));
    expect(res).not.toBe(true); // returns UrlTree('/')
  });
  it('allows when precondition met', () => {
    const s = TestBed.inject(OnboardingFlowState);
    s.setIdentity('a@b.com', '0105563000012'); s.setOtpRef('SE-1');
    const res = TestBed.runInInjectionContext(() => flowGuard('otp')({} as any, {} as any));
    expect(res).toBe(true);
  });
});

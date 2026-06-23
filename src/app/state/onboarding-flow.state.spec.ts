import { OnboardingFlowState } from './onboarding-flow.state';
describe('OnboardingFlowState', () => {
  it('starts empty and stores then resets', () => {
    const s = new OnboardingFlowState();
    expect(s.email()).toBe('');
    s.setIdentity('a@b.com', '0105563000012'); s.setOtpRef('SE-1'); s.markOtpVerified(); s.markSubscribed();
    expect(s.email()).toBe('a@b.com'); expect(s.otpRef()).toBe('SE-1');
    expect(s.otpVerified()).toBe(true); expect(s.subscribed()).toBe(true);
    s.reset();
    expect(s.email()).toBe(''); expect(s.otpVerified()).toBe(false);
  });
});

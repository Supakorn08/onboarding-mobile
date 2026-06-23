import { firstValueFrom } from 'rxjs';
import { mockVerifyEligibility, mockVerifyOtp, resetMockState } from './subscription.mock';
import { EligibilityFailure, OtpFailure } from './subscription.model';

describe('subscription.mock', () => {
  beforeEach(() => resetMockState());
  it('eligible on happy values', async () => {
    const r = await firstValueFrom(mockVerifyEligibility({ email: 'test@superapp.com', juristicId: '0105563000012' }));
    expect(r.data?.eligible).toBe(true);
  });
  it('NoMatch on all-zero id', async () => {
    const r = await firstValueFrom(mockVerifyEligibility({ email: 'test@superapp.com', juristicId: '0000000000000' }));
    expect(r.data?.failure).toBe(EligibilityFailure.NoMatch);
  });
  it('EmailNotLinked on notlinked email', async () => {
    const r = await firstValueFrom(mockVerifyEligibility({ email: 'notlinked@example.com', juristicId: '0105563000012' }));
    expect(r.data?.failure).toBe(EligibilityFailure.EmailNotLinked);
  });
  it('OTP correct verifies', async () => {
    const r = await firstValueFrom(mockVerifyOtp({ ref: 'SE-1', code: '12345678' }));
    expect(r.data?.verified).toBe(true);
  });
  it('OTP exceeded after max attempts', async () => {
    for (let i = 0; i < 2; i++) await firstValueFrom(mockVerifyOtp({ ref: 'SE-1', code: '99999999' }));
    const r = await firstValueFrom(mockVerifyOtp({ ref: 'SE-1', code: '99999999' }));
    expect(r.data?.failure).toBe(OtpFailure.Exceeded);
  });
});

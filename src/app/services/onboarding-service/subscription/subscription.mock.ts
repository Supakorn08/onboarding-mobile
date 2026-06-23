import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';
import {
  EligibilityFailure, OtpFailure,
  VerifyEligibilityRequest, EligibilityResponse,
  RequestOtpResponse, VerifyOtpRequest, VerifyOtpResponse, SubscribeResponse,
} from './subscription.model';

const meta = () => ({ traceId: 'mock-trace', timestamp: '1970-01-01T00:00:00Z', path: '/mock' });
const wrap = <T>(data: T): Observable<{ data: T; meta: ReturnType<typeof meta> }> =>
  of({ data, meta: meta() }).pipe(delay(800));

let otpAttempts = 0;
export const resetMockState = () => { otpAttempts = 0; };

export function mockVerifyEligibility(req: VerifyEligibilityRequest): Observable<EligibilityResponse> {
  const emailBad = req.email === 'notfound@example.com';
  const idBad = req.juristicId === '1111111111111';
  let failure: EligibilityFailure | undefined;
  if (req.juristicId === '0000000000000') failure = EligibilityFailure.NoMatch;
  else if (req.email === 'notlinked@example.com') failure = EligibilityFailure.EmailNotLinked;
  else if (emailBad && idBad) failure = EligibilityFailure.BothInvalid;
  else if (emailBad) failure = EligibilityFailure.EmailNotFound;
  else if (idBad) failure = EligibilityFailure.JuristicNotFound;
  return wrap({ eligible: !failure, failure });
}

export function mockRequestOtp(): Observable<RequestOtpResponse> {
  otpAttempts = 0;
  return wrap({ ref: 'SE-0123456', expiresInMinutes: environment.otpConfig.otpExpiryMinutes });
}

export function mockVerifyOtp(req: VerifyOtpRequest): Observable<VerifyOtpResponse> {
  const max = environment.otpConfig.otpMaxAttempts;
  if (req.code === '12345678') { otpAttempts = 0; return wrap({ verified: true }); }
  if (req.code === '00000000') return wrap({ verified: false, failure: OtpFailure.Expired });
  otpAttempts += 1;
  if (otpAttempts >= max) return wrap({ verified: false, failure: OtpFailure.Exceeded, remainingAttempts: 0 });
  return wrap({ verified: false, failure: OtpFailure.Incorrect, remainingAttempts: max - otpAttempts });
}

export function mockSubscribe(): Observable<SubscribeResponse> { return wrap({ subscribed: true }); }

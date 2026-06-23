import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import * as mock from './subscription.mock';
import {
  VerifyEligibilityRequest, EligibilityResponse, RequestOtpResponse,
  VerifyOtpRequest, VerifyOtpResponse, SubscribeResponse,
} from './subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.servicePaths.baseDomain}/${environment.servicePaths.onboarding}`;

  verifyEligibility(req: VerifyEligibilityRequest): Observable<EligibilityResponse> {
    if (environment.useMock) return mock.mockVerifyEligibility(req);
    return this.http.post<EligibilityResponse>(`${this.base}/v1/eligibility`, req);
  }
  requestOtp(email: string): Observable<RequestOtpResponse> {
    if (environment.useMock) return mock.mockRequestOtp();
    return this.http.post<RequestOtpResponse>(`${this.base}/v1/otp/request`, { email });
  }
  verifyOtp(req: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    if (environment.useMock) return mock.mockVerifyOtp(req);
    return this.http.post<VerifyOtpResponse>(`${this.base}/v1/otp/verify`, req);
  }
  subscribe(): Observable<SubscribeResponse> {
    if (environment.useMock) return mock.mockSubscribe();
    return this.http.post<SubscribeResponse>(`${this.base}/v1/subscribe`, {});
  }
}

import { ApiResponse } from '../../../shared/models/api-response.model';

export enum EligibilityFailure {
  EmailNotFound = 'EMAIL_NOT_FOUND',
  JuristicNotFound = 'JURISTIC_NOT_FOUND',
  BothInvalid = 'BOTH_INVALID',
  NoMatch = 'NO_MATCH',
  EmailNotLinked = 'EMAIL_NOT_LINKED',
}
export enum OtpFailure { Incorrect = 'INCORRECT', Expired = 'EXPIRED', Exceeded = 'EXCEEDED' }

export interface VerifyEligibilityRequest { email: string; juristicId: string; }
export interface VerifyEligibilityResult { eligible: boolean; failure?: EligibilityFailure; }
export interface RequestOtpResult { ref: string; expiresInMinutes: number; }
export interface VerifyOtpRequest { ref: string; code: string; }
export interface VerifyOtpResult { verified: boolean; failure?: OtpFailure; remainingAttempts?: number; }
export interface SubscribeResult { subscribed: boolean; }

export type EligibilityResponse = ApiResponse<VerifyEligibilityResult>;
export type RequestOtpResponse = ApiResponse<RequestOtpResult>;
export type VerifyOtpResponse = ApiResponse<VerifyOtpResult>;
export type SubscribeResponse = ApiResponse<SubscribeResult>;

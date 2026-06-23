export const environment = {
  production: true,
  useMock: true,
  servicePaths: { baseDomain: '', onboarding: '' },
  otpConfig: {
    otpRequestCooldownSeconds: 30,
    otpExpiryMinutes: 5,
    otpMaxAttempts: 3,
    otpResendMax: 3,
  },
};

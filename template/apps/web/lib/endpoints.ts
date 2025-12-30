export const ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/signIn',
    OTP: (tenantSlug: string, otp: number) => `auth/otp/${tenantSlug}/${otp}`,
    RENEW_SESSION: 'auth/renewSession',
  },
} as const;

export const enum EnpointMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type EndpointKey = keyof typeof ENDPOINTS;

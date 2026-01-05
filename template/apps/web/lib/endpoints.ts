export const ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/signIn',
    RENEW_SESSION: 'auth/renewSession',
  },
  TODOS: {
    GET: 'todos',
    PATCH: (id: number) => `todos/${id}`,
    POST: '',
    DELETE: (id: number) => `todos/${id}`,
  },
} as const;

export const enum EnpointMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type EndpointKey = keyof typeof ENDPOINTS;

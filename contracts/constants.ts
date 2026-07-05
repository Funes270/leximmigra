export const Session = {
  CookieName: "session_token",
} as const;

export const ErrorMessages = {
  unauthenticated: "Unauthorized",
  insufficientRole: "Forbidden",
} as const;
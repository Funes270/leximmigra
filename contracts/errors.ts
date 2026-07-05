import { TRPCError } from "@trpc/server";

export function throwUnauthorized(message?: string): never {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: message ?? "Unauthorized",
  });
}

export function throwForbidden(message?: string): never {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: message ?? "Forbidden",
  });
}

export function throwBadRequest(message?: string): never {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: message ?? "Bad Request",
  });
}

export function throwNotFound(message?: string): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: message ?? "Not Found",
  });
}
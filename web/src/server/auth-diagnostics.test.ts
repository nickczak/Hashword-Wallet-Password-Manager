import { expect, it } from "vitest";
import { authFailureDiagnostic } from "./auth-diagnostics";

it("identifies wrapped database failures without exposing raw error details", () => {
  const error = new Error("query contained private credentials", {
    cause: Object.assign(new Error("postgresql://private:password@host/db"), {
      code: "42P01", detail: "private account data", query: "private SQL",
    }),
  });
  const diagnostic = authFailureDiagnostic(error);
  expect(diagnostic.code).toBe("42P01");
  expect(diagnostic.detail).toContain("migrations");
  expect(JSON.stringify(diagnostic)).not.toContain("private");
});

it("identifies configuration failures without logging environment values", () => {
  expect(authFailureDiagnostic({ code: "AUTH_HTTPS_REQUIRED", message: "private URL" })).toEqual({
    code: "AUTH_HTTPS_REQUIRED", detail: "BETTER_AUTH_URL must use HTTPS in production.",
  });
});

it("does not log unknown codes, arbitrary thrown values, or prototype properties", () => {
  for (const error of ["private secret", null, { code: "private code" }, { code: "constructor" }]) {
    expect(authFailureDiagnostic(error).code).toBe("AUTH_UNEXPECTED_FAILURE");
    expect(JSON.stringify(authFailureDiagnostic(error))).not.toContain("private");
  }
});

it("bounds traversal of circular causes", () => {
  const error: { cause?: unknown } = {};
  error.cause = error;
  expect(authFailureDiagnostic(error).code).toBe("AUTH_UNEXPECTED_FAILURE");
});

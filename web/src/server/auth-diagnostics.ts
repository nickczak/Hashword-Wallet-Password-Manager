// Only fixed descriptions may reach logs. Raw errors can contain credentials,
// connection strings, SQL parameters, or user data.
const descriptions: Record<string, string> = {
  AUTH_DATABASE_URL_MISSING: "DATABASE_URL is missing from the server environment.",
  AUTH_SECRET_INVALID: "BETTER_AUTH_SECRET is missing or shorter than 32 characters.",
  AUTH_URL_MISSING: "BETTER_AUTH_URL is missing from the server environment.",
  AUTH_URL_INVALID: "BETTER_AUTH_URL is not a valid absolute URL.",
  AUTH_HTTPS_REQUIRED: "BETTER_AUTH_URL must use HTTPS in production.",
  EAI_AGAIN: "Database hostname lookup temporarily failed.",
  ENOTFOUND: "Database hostname could not be resolved.",
  ECONNREFUSED: "Database connection was refused.",
  ECONNRESET: "Database connection was reset.",
  ETIMEDOUT: "Database connection timed out.",
  "28P01": "Database password authentication failed.",
  "28000": "Database authorization failed.",
  "3D000": "Configured database does not exist.",
  "42P01": "An authentication table is missing. Run the auth migrations against the production database.",
  "42703": "An authentication column is missing. Check production auth migrations.",
  "42501": "Database role lacks required permissions.",
  "53300": "Database connection limit reached.",
  CERT_HAS_EXPIRED: "Database TLS certificate has expired.",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "Database TLS certificate verification failed.",
  SELF_SIGNED_CERT_IN_CHAIN: "Database TLS certificate chain is not trusted.",
};

export function authFailureDiagnostic(error: unknown) {
  // Database adapters sometimes wrap the PostgreSQL error in `cause`.
  let current = error;
  for (let depth = 0; depth < 5; depth++) {
    if (!current || typeof current !== "object") break;
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (typeof code === "string" && Object.hasOwn(descriptions, code)) {
      return { code, detail: descriptions[code] };
    }
    current = cause;
  }
  return { code: "AUTH_UNEXPECTED_FAILURE", detail: "Authentication failed with an unclassified server error." };
}

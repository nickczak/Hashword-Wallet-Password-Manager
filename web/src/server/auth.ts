import "server-only";

import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";

const shared = globalThis as typeof globalThis & { hashwordDB?: Pool };
let auth: ReturnType<typeof createAuth> | undefined;

function createAuth() {
  const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = process.env;
  if (!DATABASE_URL) {
    throw Object.assign(new Error("Set DATABASE_URL in the server environment."), { code: "AUTH_DATABASE_URL_MISSING" });
  }
  if (!BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32) {
    throw Object.assign(new Error("Set BETTER_AUTH_SECRET to at least 32 characters."), { code: "AUTH_SECRET_INVALID" });
  }
  if (!BETTER_AUTH_URL) {
    throw Object.assign(new Error("Set BETTER_AUTH_URL in the server environment."), { code: "AUTH_URL_MISSING" });
  }
  let url: URL;
  try {
    url = new URL(BETTER_AUTH_URL);
  } catch {
    throw Object.assign(new Error("BETTER_AUTH_URL must be an absolute URL."), { code: "AUTH_URL_INVALID" });
  }
  const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw Object.assign(new Error("Use HTTPS outside local development."), { code: "AUTH_HTTPS_REQUIRED" });
  }
  shared.hashwordDB ??= new Pool({
    connectionString: DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
    statement_timeout: 10000,
  });
  return betterAuth({
    database: shared.hashwordDB,
    secret: BETTER_AUTH_SECRET,
    baseURL: url.origin,
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
    plugins: [username()],
    rateLimit: { enabled: true, storage: "database" },
    logger: { disabled: true },
  });
}

// Lazy initialization keeps builds independent of database credentials.
// Only backend routes and the migration config should import this module.
export function getAuth() { return auth ??= createAuth(); }

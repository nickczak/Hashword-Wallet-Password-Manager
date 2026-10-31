import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";

const shared = globalThis as typeof globalThis & { hashwordDB?: Pool };
let auth: ReturnType<typeof createAuth> | undefined;

function createAuth() {
  const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = process.env;
  if (!DATABASE_URL || !BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32 || !BETTER_AUTH_URL) {
    throw new Error("Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL in web/.env.local.");
  }
  const url = new URL(BETTER_AUTH_URL);
  const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new Error("Use HTTPS outside local development.");
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

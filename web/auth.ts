// Loads the same auth configuration for the database migration CLI.
import { loadEnvConfig } from "@next/env";
import { getAuth } from "./src/server/auth";

loadEnvConfig(process.cwd());
export const auth = getAuth();

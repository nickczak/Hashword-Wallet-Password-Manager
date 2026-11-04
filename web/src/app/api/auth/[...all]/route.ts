// Next.js runs this file on the server to answer HTTP requests, rather than
// render a page. The [...all] folder matches paths beneath /api/auth/, such as
// /api/auth/sign-in/username and /api/auth/get-session.
// Both the website and CLI send their authentication requests here.

// Prevent this module from being imported into browser code.
import "server-only";
import { getAuth } from "@/server/auth";
import { authFailureDiagnostic } from "@/server/auth-diagnostics";

async function handle(request: Request) {
  try {
    // getAuth() creates the configured Better Auth instance when first needed.
    // It chooses the auth endpoint, checks credentials or sessions as needed (includes session cookies)
    const response = await getAuth().handler(request);
    // Tell browsers and proxies not to cache authentication responses.
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[auth] Request failed", authFailureDiagnostic(error));
    // Keep internal error details out of the client response.
    // Normal auth failures, like a wrong password, are handled by Better Auth.
    return Response.json(
      { message: "Account login is unavailable. Check the server configuration and database setup." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

// Next.js calls the matching export for each HTTP method. Both use our handler:
export { handle as GET, handle as POST };

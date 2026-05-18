import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
  "/accounts(.*)",
  "/categories(.*)",
  "/tags(.*)",
  "/goals(.*)",
  "/profile(.*)",
  "/settings(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (
    req.nextUrl.pathname === "/api/inngest" ||
    req.nextUrl.pathname === "/x/inngest" ||
    req.nextUrl.pathname === "/.netlify/functions/inngest" ||
    req.nextUrl.pathname === "/.redwood/functions/inngest"
  ) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname === "/sign%20in" || req.nextUrl.pathname === "/sign in") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);

    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * A dependency-free endpoint used to wake the Render web service before an
 * authentication navigation. Keeping it independent of Clerk and Postgres
 * means a successful response tells the client that the Next.js server is
 * ready to serve the sign-in or sign-up page.
 */
export async function GET() {
  return Response.json(
    { status: "ok" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

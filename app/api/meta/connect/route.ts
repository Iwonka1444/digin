export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    response_type: "code",
    scope: "public_profile",
  });

  return Response.redirect(
    `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`
  );
}
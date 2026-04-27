export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    response_type: "code",
    scope:
      "pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish",
  });

  return Response.redirect(
    `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`
  );
}
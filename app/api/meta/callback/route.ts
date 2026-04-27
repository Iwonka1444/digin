export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code", { status: 400 });
  }

  const tokenRes = await fetch(
    `https://graph.facebook.com/v23.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${process.env.META_REDIRECT_URI}&client_secret=${process.env.META_APP_SECRET}&code=${code}`
  );

  const tokenData = await tokenRes.json();

  console.log("META TOKEN:", tokenData);

await supabase.from("meta_accounts").insert({
  access_token: data.access_token,
});

  return Response.redirect("https://digin-two.vercel.app/dashboard");
}
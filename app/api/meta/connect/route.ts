import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing Meta code" }, { status: 400 });
  }

  const tokenUrl = new URL("https://graph.facebook.com/v20.0/oauth/access_token");

  tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
  tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  tokenUrl.searchParams.set("redirect_uri", process.env.META_REDIRECT_URI!);
  tokenUrl.searchParams.set("code", code);

  const res = await fetch(tokenUrl.toString());
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: 400 });
  }

  return NextResponse.json({
    message: "Meta connected",
    access_token: data.access_token,
  });
}
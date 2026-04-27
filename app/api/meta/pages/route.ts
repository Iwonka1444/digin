import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 400 }
    );
  }

  const url = new URL("https://graph.facebook.com/v20.0/me/accounts");

  url.searchParams.set("fields", "id,name,access_token,category");
  url.searchParams.set("access_token", token);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: 400 });
  }

  return NextResponse.json(data);
}
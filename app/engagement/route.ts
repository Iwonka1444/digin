import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: brandProfile } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const body = await req.json();
    const { postContent, commentContext } = body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are a social media engagement expert${brandProfile ? ` for ${brandProfile.company}` : ""}.
${brandProfile ? `Brand tone: ${brandProfile.tone}` : ""}

Write 3 different comments to leave under this post.
${postContent ? `Post content: "${postContent}"` : ""}
${commentContext ? `Comment angle: ${commentContext}` : ""}

Rules:
- Short (1-2 sentences max)
- Human and warm
- Not salesy
- Natural and authentic

Reply ONLY in JSON format (no markdown):
{"comments": ["comment1", "comment2", "comment3"]}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const raw = response.choices?.[0]?.message?.content ?? "{}";
    let parsed: { comments: string[] } = { comments: [] };
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "AI response parse error." }, { status: 500 });
    }

    return NextResponse.json({ comments: parsed.comments });
  } catch (error) {
    console.error("API /engagement error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
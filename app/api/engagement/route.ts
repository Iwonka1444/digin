import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "../../../lib/supabase/server";

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
      .single();

    const body = await req.json();
    const { postContent, commentContext } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are a social media expert for a brand.
${brandProfile ? `Brand: ${brandProfile.company}, industry: ${brandProfile.industry}, tone: ${brandProfile.tone}` : ""}
${postContent ? `Post to comment on:\n"${postContent}"` : ""}
${commentContext ? `Context: ${commentContext}` : ""}

Write 3 different comments that can be left under this post.
Comments must be:
- Short (1-2 sentences)
- Human and warm
- Relationship-building, not salesy
- Matching the brand tone

Reply ONLY in JSON format (no markdown):
{"comments": ["comment1", "comment2", "comment3"]}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices?.[0]?.message?.content ?? "{}";

    let parsed: { comments: string[] } = { comments: [] };
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    return NextResponse.json({ comments: parsed.comments });
  } catch (error) {
    console.error("API /engagement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
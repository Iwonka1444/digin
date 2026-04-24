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

    const { data: brandProfile, error: brandError } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (brandError || !brandProfile) {
      return NextResponse.json({ error: "Brand profile not found. Please set up your brand profile first." }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const {
      platform = "Instagram",
      type = "Sales post",
      topic = "",
      includeHashtags = true,
      tone = "default",
      length = "medium",
    } = body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are a social media copywriter for ${brandProfile.company}.

BRAND:
- Industry: ${brandProfile.industry}
- Offer: ${brandProfile.offer}
- Target audience: ${brandProfile.audience}
- Brand tone: ${brandProfile.tone}

TASK: Write ONE ${type} post for ${platform}.
Topic: ${topic || "general brand promotion"}

STRICT RULES — follow exactly:
- Tone: ${tone === "default" ? brandProfile.tone : tone}
- Length: ${length === "short" ? "MAXIMUM 3 lines total. Be extremely concise. No long paragraphs." : length === "long" ? "7-10 lines. Detailed and rich." : "4-6 lines. Balanced."}
- Platform style: ${platform === "Instagram" ? "casual, visual, emojis allowed" : platform === "LinkedIn" ? "professional, insight-driven, no emojis" : "friendly, conversational, relatable"}
- Post type: ${type === "Sales post" ? "create desire, show transformation, strong CTA" : type === "Educational" ? "teach one specific thing, give real value, end with insight" : "tell a real story with beginning, tension, and resolution"}
- Write in the same language as the brand tone and audience context
- DO NOT write long paragraphs if length is short — respect the length rule strictly
- First line must be a scroll-stopping hook
- End with one clear CTA
${includeHashtags ? "- Add 5 relevant hashtags at the end" : "- NO hashtags"}

Write ONLY the post text. No explanations. No labels. No intro sentences.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: length === "short" ? 150 : length === "long" ? 600 : 350,
    });

    const output = response.choices?.[0]?.message?.content ?? "No response from model.";

    return NextResponse.json({ output });
  } catch (error) {
    console.error("API /generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
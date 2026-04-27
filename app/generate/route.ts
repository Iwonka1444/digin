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

    const { data: brandProfile, error: brandError } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (brandError || !brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a top-tier social media copywriter.

Write like a human. Not like AI. Not like a corporate brand.

Brand:
- Company: ${brandProfile.company}
- Industry: ${brandProfile.industry}
- Tone: ${brandProfile.tone}
- Offer: ${brandProfile.offer}
- Audience: ${brandProfile.audience}

Task:
Write a ${type} post for ${platform}.

Topic:
${topic || "promoting the brand in a real, relatable way"}

STRICT RULES:
- NO generic marketing phrases (e.g. "key to success", "grow your business", "contact us today")
- NO corporate tone
- NO empty motivational bullshit
- Write like a real person talking
- Keep it simple, direct, slightly emotional
- Mix short and medium sentences
- Do NOT put every sentence on a new line
- Maximum 1 empty line between paragraphs
- Keep paragraphs natural

Platform style:
${
  platform === "Instagram"
    ? "- emotional, visual, relatable, can use 1–2 emojis max"
    : platform === "LinkedIn"
    ? "- professional but human, no emojis"
    : "- conversational, natural, community-driven"
}

Post type:
${
  type === "Sales post"
    ? "- show problem → tension → solution → subtle CTA"
    : type === "Educational"
    ? "- explain one thing clearly and simply"
    : "- tell a short real-feeling story"
}

Tone override:
${tone === "default" ? "- use brand tone" : `- ${tone}`}

Length:
${
  length === "short"
    ? "- very short (2–3 paragraphs max)"
    : length === "long"
    ? "- longer (max 3 short paragraphs)"
    : "- medium (2–3 paragraphs)"
}

Structure:
- First line = strong hook (STOP the scroll)
- Then 2–3 short paragraphs (NOT one line per sentence)
- End with a natural CTA (not pushy)
${
  includeHashtags
    ? "- Add hashtags in ONE final line only (max 5)"
    : "- No hashtags"
}

Write ONLY the post. No explanation.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens:
        length === "short" ? 120 : length === "long" ? 600 : 350,
    });

    const rawOutput =
      response.choices?.[0]?.message?.content ?? "No response from model.";

    // 🔥 CLEAN OUTPUT (usuwa głupie odstępy i AI spacing)
    const output = rawOutput
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();

    return NextResponse.json({ output });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
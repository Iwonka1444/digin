import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function normalizeOutput(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function getVisualStyleLabel(style?: string | null) {
  const map: Record<string, string> = {
    minimalist: "minimalist, clean, calm, lots of space",
    bold: "bold, confident, high-impact, strong contrast",
    elegant: "elegant, refined, premium, polished",
    playful: "playful, creative, light, friendly",
    corporate: "structured, trustworthy, professional",
    natural: "natural, organic, warm, human",
    modern: "modern, fresh, sleek, digital",
    vintage: "vintage, nostalgic, retro-inspired",
  };

  if (!style) return "not specified";
  return map[style] || style;
}

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

    const brandColors = brandProfile.brand_colors || "not specified";
    const visualStyle = getVisualStyleLabel(brandProfile.brand_style);

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
- Brand colors: ${brandColors}
- Visual style: ${visualStyle}

Use the brand colors and visual style as inspiration for the mood, word choice and vibe.
Example:
- minimalist = simple, calm, clean copy
- bold = sharper hooks, more confidence
- elegant/luxury = premium, refined words
- natural = warmer and more human
- playful = lighter and more creative

Task:
Write a ${type} post for ${platform}.

Topic:
${topic || "promoting the brand in a real, relatable way"}

STRICT RULES:
- NO generic marketing phrases like: "key to success", "grow your business", "contact us today", "unlock your potential", "take your brand to the next level"
- NO corporate tone
- NO empty motivational slogans
- NO fake excitement
- NO long intros
- Write like a real person talking
- Keep it simple, direct, slightly emotional
- Mix short and medium sentences
- Do NOT put every sentence on a new line
- Maximum 1 empty line between paragraphs
- Keep paragraphs natural
- CTA must sound natural, not pushy

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
    ? "- teach one specific thing clearly and simply"
    : "- tell a short real-feeling story with a beginning, tension and resolution"
}

Tone override:
${tone === "default" ? "- use brand tone" : `- ${tone}`}

Length:
${
  length === "short"
    ? "- very short: 2 paragraphs max"
    : length === "long"
    ? "- longer: max 3 short paragraphs"
    : "- medium: 2–3 paragraphs"
}

Structure:
- First line = strong hook
- Then 2–3 short paragraphs
- End with one natural CTA
${
  includeHashtags
    ? "- Add hashtags in ONE final line only, max 5 hashtags"
    : "- No hashtags"
}

Write ONLY the post. No explanation.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.82,
      max_tokens: length === "short" ? 120 : length === "long" ? 600 : 350,
    });

    const rawOutput =
      response.choices?.[0]?.message?.content ?? "No response from model.";

    const output = normalizeOutput(rawOutput);

    return NextResponse.json({ output });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
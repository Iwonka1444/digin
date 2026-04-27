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
      return NextResponse.json(
        { error: "Brand profile not found" },
        { status: 404 }
      );
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

    // STEP 1: zamienia słaby temat usera w dobry marketing angle
    const topicRewritePrompt = `
Rewrite this raw user topic into a strong marketing angle.

The user may write something simple like:
"25% discount"
"new website offer"
"logo promotion"
"social media service"

Your job:
- find the real customer problem behind it
- make it about the customer, not the brand
- make it emotional, specific and relatable
- do NOT write a post yet
- return only one rewritten topic sentence

Raw topic:
${topic || "general brand promotion"}
`;

    const topicRewriteResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You transform weak marketing topics into strong customer-focused angles.",
        },
        { role: "user", content: topicRewritePrompt },
      ],
      temperature: 0.7,
      max_tokens: 80,
    });

    const rewrittenTopic =
      topicRewriteResponse.choices?.[0]?.message?.content?.trim() ||
      topic ||
      "helping customers understand why their online presence is not bringing clients";

    // STEP 2: generuje właściwy post
    const prompt = `
You are a high-performing social media copywriter.

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

Task:
Write a ${type} post for ${platform}.

Write like someone who understands real clients, not marketing theory.
Avoid sounding like an ad. Sound like a real observation.

Original user topic:
${topic || "general brand promotion"}

Improved marketing angle:
${rewrittenTopic}

STRICT RULES:
- NEVER write like a promotion or announcement
- NEVER start with discounts, offers, or "only X people"
- ALWAYS start from a real pain, frustration, or situation
- Make the reader feel: "this is about me"
- NO generic marketing phrases like: "key to success", "grow your business", "contact us today", "unlock your potential", "take your brand to the next level"
- NO corporate tone
- NO empty motivational slogans
- NO fake excitement
- NO long intros
- Write like a real person talking
- Keep it simple, direct, slightly emotional
- Mix short and medium sentences
- Write in compact paragraphs
- Do not create big empty spaces
- Do not put every sentence on a separate line
- Use maximum 2 paragraphs before CTA
- Each paragraph should have 2–3 sentences
- Only the hook may be a single line
- CTA must be soft and natural, not pushy
- Avoid phrases like: "you are not alone", "transform your business", "take it to the next level", "this is more than"
- Be specific instead of generic
- Show what actually happens (real situations, not descriptions)

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
    ? "- show problem, tension, solution and subtle CTA"
    : type === "Educational"
    ? "- teach one specific thing clearly and simply"
    : "- tell a short real-feeling story with a beginning, tension and resolution"
}

Tone override:
${tone === "default" ? "- use brand tone" : `- ${tone}`}

Length:
${
  length === "short"
    ? "- very short: hook + 1 paragraph + CTA"
    : length === "long"
    ? "- longer: hook + 2 compact paragraphs + CTA"
    : "- medium: hook + 1–2 compact paragraphs + CTA"
}

Structure:
- Line 1: strong relatable hook
- Paragraph 1: explain the problem in 2–3 sentences
- Paragraph 2: connect the problem to the offer in 2–3 sentences
- Final line: soft CTA
${
  includeHashtags
    ? "- Add hashtags in ONE final line only, max 5 hashtags"
    : "- No hashtags"
}

Write ONLY the post. No explanation.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write social media posts that convert into real client interest, not just likes.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: length === "short" ? 140 : length === "long" ? 650 : 400,
    });

    const rawOutput =
      response.choices?.[0]?.message?.content ?? "No response from model.";

    const output = normalizeOutput(rawOutput)
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({ output });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
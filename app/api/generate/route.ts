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
    minimalist: "minimalist, clean, calm",
    bold: "bold, high-impact, strong",
    elegant: "elegant, premium, polished",
    playful: "playful, creative, friendly",
    corporate: "professional, structured",
    natural: "natural, organic, warm",
    modern: "modern, sleek, fresh",
    vintage: "vintage, retro",
  };
  return style ? (map[style] || style) : "modern and clean";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
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
      generateImage = false,
    } = body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const activeTone = tone === "default" ? brandProfile.tone : tone;
    const visualStyle = getVisualStyleLabel(brandProfile.brand_style);

    const lengthRule =
      length === "short"
        ? "3–4 lines total. Hook + 1 short paragraph + CTA. Absolute maximum."
        : length === "long"
        ? "10–14 lines. Hook + 2–3 paragraphs + CTA + hashtags."
        : "6–9 lines. Hook + 1–2 paragraphs + CTA.";

    const platformRule =
      platform === "Instagram"
        ? "Emotional, visual, relatable. Max 2 emojis. Short sentences."
        : platform === "LinkedIn"
        ? "Professional but human. No emojis. Insight-driven. Slightly longer sentences."
        : "Conversational, warm, community feel. Natural language.";

    const typeRule =
      type === "Sales post"
        ? `SALES POST — structure:
1. Hook: identify a real pain or frustration the audience has
2. Agitate: show what goes wrong because of this problem
3. Solution: naturally connect to what the brand offers
4. CTA: soft, natural, not pushy`
        : type === "Educational"
        ? `EDUCATIONAL POST — structure:
1. Hook: a surprising fact, common mistake, or bold statement
2. Teach: explain ONE specific useful thing clearly
3. Apply: help reader see how to use this
4. CTA: invite them to learn more or ask a question`
        : `STORYTELLING POST — structure:
1. Hook: start with a real scene or moment
2. Build: show tension, a challenge, or a turning point
3. Resolve: show the outcome or lesson
4. CTA: make it personal and warm`;

    const prompt = `You are an elite marketing copywriter. Your job is to write social media posts that generate real business — not just likes.

BRAND:
- Company: ${brandProfile.company}
- Industry: ${brandProfile.industry}
- Tone: ${activeTone}
- Offer: ${brandProfile.offer}
- Audience: ${brandProfile.audience}
- Visual style: ${visualStyle}

TASK: Write ONE ${type} post for ${platform}.
Topic: ${topic || "brand promotion and visibility"}

POST TYPE STRUCTURE:
${typeRule}

PLATFORM RULES:
${platformRule}

LENGTH:
${lengthRule}

TONE RULES:
- Write like a real expert human, not AI
- Never sound like a press release or corporate announcement
- No fake excitement, no empty slogans
- No phrases like: "take your brand to the next level", "grow your business", "contact us today", "unlock your potential", "key to success"
- Be specific — show real situations, real emotions, real results
- Make the reader think: "this is exactly my problem"

FORMATTING:
- Start with a strong hook on its own line (NOT a question, NOT an emoji)
- Leave ONE blank line between paragraphs
- Each paragraph: 2–3 sentences max
- CTA on its own line at the end
- ${includeHashtags ? "Add 3–5 relevant hashtags on a separate line at the very end" : "NO hashtags"}

LANGUAGE: Write in the language that matches the brand and audience. If Dutch audience → Dutch. If Polish → Polish. If mixed → English.

CRITICAL: Write ONLY the post. No explanations, no labels, no "Here is your post:". Just the post text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are DiGin's senior marketing strategist and copywriter. You have 15 years of experience writing copy that converts for small and medium businesses. You know exactly what stops the scroll, what triggers action, and what builds brand trust. You never write generic content. Every word you write serves a purpose.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: length === "short" ? 200 : length === "long" ? 700 : 450,
    });

    const rawOutput = response.choices?.[0]?.message?.content ?? "No response from model.";
    const output = normalizeOutput(rawOutput);

    // ── Optional image generation ──────────────────────────────────────────
    let imageUrl: string | null = null;

    if (generateImage) {
      try {
        let brandColors = "";
        try {
          const parsed = JSON.parse(brandProfile.brand_colors || "[]");
          if (Array.isArray(parsed) && parsed.length > 0) {
            brandColors = `Brand colors: ${parsed.join(", ")}.`;
          }
        } catch {}

        const imagePrompt = `Professional social media image for ${brandProfile.company}, a ${brandProfile.industry} brand.
Style: ${visualStyle}. ${brandColors}
Topic: ${topic || "brand promotion"}.
Platform: ${platform}.
Requirements: No text, no logos, no watermarks. Clean, high-quality, ${platform === "LinkedIn" ? "corporate and trustworthy" : platform === "Instagram" ? "visually striking and emotional" : "friendly and approachable"}. Photorealistic or clean graphic style.`.trim();

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: platform === "LinkedIn" ? "1792x1024" : "1024x1024",
          quality: "standard",
        });

        imageUrl = imageResponse.data?.[0]?.url ?? null;
      } catch (imgError) {
        console.error("Image generation error:", imgError);
      }
    }

    return NextResponse.json({ output, imageUrl });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
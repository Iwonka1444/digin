import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "../../../lib/supabase/server";

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
      return NextResponse.json({ error: "Brand profile not found." }, { status: 404 });
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
      generateImage = false,
    } = body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const activeTone = tone === "default" ? brandProfile.tone : tone;

    const lengthInstruction =
      length === "short"
        ? "Write MAXIMUM 3 short lines. This is an absolute limit — no exceptions."
        : length === "long"
        ? "Write 7–10 lines. Be detailed, rich, and engaging."
        : "Write 4–6 lines. Balanced and clear.";

    const platformStyle =
      platform === "Instagram"
        ? "Visual and emotional. Use line breaks between every sentence. Emojis allowed but not required."
        : platform === "LinkedIn"
        ? "Professional and insightful. Use short paragraphs. No emojis. Start with a bold statement."
        : "Friendly and conversational. Use short sentences. Relatable tone.";

    const typeInstruction =
      type === "Sales post"
        ? "Create desire. Show a transformation or result. End with a strong, clear CTA."
        : type === "Educational"
        ? "Teach ONE specific, valuable thing. Give a real tip or insight. End with a key takeaway."
        : "Tell a real story with a beginning, a tension point, and a resolution. Make it personal and human.";

    const prompt = `
You are writing a social media post for ${brandProfile.company}.

BRAND CONTEXT:
- Industry: ${brandProfile.industry}
- Offer: ${brandProfile.offer}
- Target audience: ${brandProfile.audience}
- Brand tone: ${activeTone}

TASK: Write ONE ${type} post for ${platform}.
Topic: ${topic || "general brand promotion"}

FORMATTING RULES — follow exactly:
- ${lengthInstruction}
- Use line breaks between EVERY sentence or idea. Each sentence on its own line.
- Add ONE empty line between paragraphs or sections.
- NO walls of text. Short, punchy, scannable.
- Platform style: ${platformStyle}
- Post type: ${typeInstruction}
- First line = scroll-stopping hook. Make it powerful.
- Last line = one clear CTA.
${includeHashtags ? "- Add 5 relevant hashtags on a NEW line at the very end, after an empty line." : "- NO hashtags."}

LANGUAGE: Write in the language that matches the brand and audience. If the brand is Dutch, write in Dutch. If Polish, write in Polish. If English, write in English.

Write ONLY the post. No explanations. No labels. No intro text. Just the post.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are DiGin — an elite social media strategist and copywriter.
You think like a top marketing agency. Every post you write feels human, strategic, and brand-specific.
You never write generic AI content. You understand psychology of buying, emotional triggers, and what stops the scroll.
You always use proper line breaks and paragraph spacing — never write walls of text.
You write for real businesses that want real results.
You always write in the language of the brand and audience.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: length === "short" ? 200 : length === "long" ? 700 : 400,
    });

    const output = response.choices?.[0]?.message?.content ?? "No response from model.";

    // ── Image generation ────────────────────────────────────────────────────
    let imageUrl: string | null = null;

    if (generateImage) {
      try {
        // Build brand-aware image prompt
        const brandColors = brandProfile.brand_colors || "";
        const brandStyle = brandProfile.brand_style || "";

        const imagePrompt = `
Create a professional social media image for ${brandProfile.company}.

Brand context:
- Industry: ${brandProfile.industry}
- Offer: ${brandProfile.offer}
- Tone: ${activeTone}
${brandColors ? `- Brand colors: ${brandColors}` : ""}
${brandStyle ? `- Visual style: ${brandStyle}` : ""}

Post topic: ${topic || "brand promotion"}
Platform: ${platform}

Style requirements:
- Clean, modern, professional design
- No text overlays (the post text will be separate)
- ${platform === "Instagram" ? "Square format feel, visually striking" : platform === "LinkedIn" ? "Clean and corporate, trust-inspiring" : "Friendly and approachable"}
- Consistent with the brand colors and identity
- High quality, photorealistic or clean graphic style
- No watermarks, no logos
`.trim();

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
        // Don't fail the whole request if image fails
        imageUrl = null;
      }
    }

    return NextResponse.json({ output, imageUrl });
  } catch (error) {
    console.error("API /generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
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
- Length: ${length === "short" ? "MAXIMUM 3 lines total. LENGTH IS THE TOP PRIORITY — overrides everything including post type. Write max 3 short lines, no exceptions." : length === "long" ? "7-10 lines. Detailed and rich." : "4-6 lines. Balanced."}
- Platform style: ${platform === "Instagram" ? "casual, visual, emojis allowed" : platform === "LinkedIn" ? "professional, insight-driven, no emojis" : "friendly, conversational, relatable"}
- Post type: ${type === "Sales post" ? "create desire, show transformation, strong CTA" : type === "Educational" ? "teach one specific thing, give real value, end with insight" : "tell a real story with beginning, tension, and resolution"}
- Write in the same language as the brand tone and audience context
- LENGTH RULE IS ABSOLUTE. If length is short, write 3 lines MAX even if post type is storytelling. Adapt the story to fit in 3 lines.
- First line must be a scroll-stopping hook
- End with one clear CTA
${includeHashtags ? "- Add 5 relevant hashtags at the end" : "- NO hashtags"}

Write ONLY the post text. No explanations. No labels. No intro sentences.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are DiGin — an elite social media strategist and copywriter.
You think like a top marketing agency. You know what converts, what stops the scroll, what builds brands.
You never write generic AI content. Every post feels human, strategic, and brand-specific.
You understand psychology of buying, social proof, FOMO, and emotional triggers.
You write for real businesses that want real results — more clients, more visibility, more sales.
You always write in the language that matches the brand and audience.`,
        },
        { role: "user", content: prompt },
      ],
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
    );<p className="text-xs font-medium text-slate-600 mb-2">📎 Add media (optional)</p>

  href={
    generatorForm.platform === "Instagram"
      ? "https://www.canva.com/create/instagram-posts/"
      : generatorForm.platform === "Facebook"
      ? "https://www.canva.com/create/facebook-posts/"
      : "https://www.canva.com/create/linkedin-banners/"
  }
  target="_blank"
  rel="noopener noreferrer"
  className="mb-3 flex items-center justify-center gap-2 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
>
  <span>🎨</span> Design in Canva → then upload below
</a>
{mediaUrl && (
{mediaUrl && (<p className="text-xs font-medium text-slate-600 mb-2">📎 Add media (optional)</p>
{mediaUrl && (<p className="text-xs font-medium text-slate-600 mb-2">📎 Add media (optional)</p>
{mediaUrl && (

  }
}
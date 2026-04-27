import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function normalizeOutput(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
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

function cleanBadStarts(text: string) {
  return text
    .replace(/^🚀\s*/g, "")
    .replace(/^🎉\s*/g, "")
    .replace(/^Unlock your potential[:!,.]?\s*/gi, "")
    .replace(/^Take your business to the next level[:!,.]?\s*/gi, "")
    .replace(/^Zrób krok w stronę sukcesu[:!,.]?\s*/gi, "")
    .replace(/^Rozwiń swój biznes[:!,.]?\s*/gi, "")
    .trim();
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

    const topicRewritePrompt = `
You transform weak user topics into strong customer-focused marketing angles.

IMPORTANT:
- Detect the language of the raw topic.
- Return the improved angle in the SAME language as the raw topic.
- If the raw topic is Polish, return Polish.
- If the raw topic is English, return English.
- If the raw topic is Dutch, return Dutch.

Bad raw topics:
"25% discount"
"promocja 25%"
"new website"
"logo"
"social media"

Good improved angles:
- "Masz stronę, ale nadal nie dostajesz zapytań od klientów."
- "Twoja marka wygląda przypadkowo, więc ludzie nie wiedzą, czy mogą Ci zaufać."
- "Publikujesz w social mediach, ale nic z tego nie wynika."

Rules:
- Make it about the customer's real problem.
- Do NOT mention discounts in the angle.
- Do NOT use motivational language.
- Do NOT use emojis.
- Return only ONE sentence.

Raw topic:
${topic || "general brand promotion"}
`;

    const topicRewriteResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You rewrite weak marketing inputs into strong, customer-problem angles.",
        },
        { role: "user", content: topicRewritePrompt },
      ],
      temperature: 0.45,
      max_tokens: 80,
    });

    const rewrittenTopic = normalizeOutput(
      topicRewriteResponse.choices?.[0]?.message?.content ||
        "Masz ofertę, ale ludzie nie widzą powodu, żeby się odezwać."
    );

    const prompt = `
You are a conversion-focused social media copywriter.

Write a ${type} post for ${platform}.

LANGUAGE RULE:
- Write the final post in the SAME language as the original user topic.
- Original topic: "${topic || "general brand promotion"}"

Brand:
- Company: ${brandProfile.company}
- Industry: ${brandProfile.industry}
- Tone: ${brandProfile.tone}
- Offer: ${brandProfile.offer}
- Audience: ${brandProfile.audience}
- Brand colors: ${brandColors}
- Visual style: ${visualStyle}

Original user topic:
${topic || "general brand promotion"}

Improved marketing angle:
${rewrittenTopic}

VERY IMPORTANT:
The post MUST be based on the improved marketing angle.
Do not start with a discount.
Do not start with an offer.
Do not start with emoji.
Do not start with a generic slogan.

BANNED PHRASES:
- każdy detal ma znaczenie
- może zmienić wszystko
- daj swojej marce nowy blask
- zrób pierwszy krok
- can do wonders
- invest in your brand image
- start taking action
- unlock your potential
- elevate your business
- achieve your dreams
- take your business to the next level
- shine bright
- stand out in a crowded market
- now is the perfect time
- don't miss this opportunity
- your business deserves the best
- contact us today

STYLE:
- Human, direct, simple.
- No corporate tone.
- No fake excitement.
- No motivational slogans.
- No big empty spacing.
- Compact paragraphs.
- Do not put every sentence on a new line.
- The hook can be one line.
- Body should be 1–2 compact paragraphs.
- CTA should be soft and natural.

CONTENT LOGIC:
1. Start with the real customer problem.
2. Show what happens in real life.
3. Explain why it matters.
4. Introduce the offer naturally.
5. CTA: one short natural action.

Platform style:
${
  platform === "Instagram"
    ? "- visual, relatable, emotional, max 1 emoji if needed"
    : platform === "LinkedIn"
    ? "- professional but human, no emojis"
    : "- conversational, simple, community-driven"
}

Post type:
${
  type === "Sales post"
    ? "- problem → tension → solution → soft CTA"
    : type === "Educational"
    ? "- teach one useful thing clearly"
    : "- tell a short realistic story"
}

Tone override:
${tone === "default" ? "- use the brand tone" : `- ${tone}`}

Length:
${
  length === "short"
    ? "- short: hook + 1 compact paragraph + CTA"
    : length === "long"
    ? "- longer: hook + 2 compact paragraphs + CTA"
    : "- medium: hook + 1–2 compact paragraphs + CTA"
}

Hashtags:
${
  includeHashtags
    ? `- Add one final line with max 5 relevant hashtags.
- Use common, popular hashtags used by real people.
- Do NOT invent or translate hashtags unnaturally.
- Keep them short and clean.`
    : `- Do not add hashtags.`
}
Write ONLY the post.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write social posts that create client interest. You avoid generic advertising language.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.72,
      max_tokens: length === "short" ? 160 : length === "long" ? 650 : 420,
    });

    const rawOutput =
      response.choices?.[0]?.message?.content ?? "No response from model.";

    const cleaned = cleanBadStarts(normalizeOutput(rawOutput));

    const firstLine =
      rewrittenTopic.charAt(0).toUpperCase() + rewrittenTopic.slice(1);

const cleanedLines = cleaned
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const cleanedWithoutDuplicate = cleanedLines
  .filter((line, index) => {
    if (index === 0 && line.toLowerCase().includes(rewrittenTopic.toLowerCase())) {
      return false;
    }

    if (line.toLowerCase() === rewrittenTopic.toLowerCase()) {
      return false;
    }

    return true;
  })
  .join("\n\n")
  .trim();

    const output = normalizeOutput(`${firstLine}\n\n${cleanedWithoutDuplicate}`);

    return NextResponse.json({
      output,
      debug: {
        originalTopic: topic,
        rewrittenTopic,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import OpenAI from "openai";

function getVisualStyleLabel(style?: string | null) {
  const map: Record<string, string> = {
    minimalist: "minimalist, clean, lots of space, calm composition",
    bold: "bold, high contrast, strong visuals, confident layout",
    elegant: "premium, refined, luxury aesthetic, polished composition",
    playful: "fun, colorful, creative, friendly visual energy",
    corporate: "structured, professional, clean, trustworthy",
    natural: "organic, warm, soft colors, human and approachable",
    modern: "sleek, tech, digital aesthetic, modern layout",
    vintage: "retro, nostalgic, muted tones, editorial feeling",
  };

  if (!style) return "modern, clean, minimal";
  return map[style] || style;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      postContent = "",
      platform = "Instagram",
      brandColors = "",
      brandStyle = "",
    } = body;

    if (!postContent.trim()) {
      return NextResponse.json(
        { error: "Missing post content" },
        { status: 400 }
      );
    }

    const visualStyle = getVisualStyleLabel(brandStyle);
    const colors =
      brandColors && String(brandColors).trim()
        ? String(brandColors)
        : "emerald green, dark navy, soft off-white";

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Create a premium social media image for ${platform} based on this post:

${postContent}

BRAND STYLE — CRITICAL:
- Use this brand color palette: ${colors}
- Visual style: ${visualStyle}
- The image must feel consistent with one modern brand identity.
- Do NOT introduce random dominant colors.
- Keep the palette limited to 2–3 main colors.
- Background should use the brand palette.
- Accent elements should use the strongest brand color.

DESIGN DIRECTION:
- premium social media design
- clean composition
- strong visual hierarchy
- modern layout
- minimal clutter
- scroll-stopping but not chaotic
- looks like a polished brand campaign, not stock illustration
- suitable for small business marketing

TEXT RULES:
- Use maximum ONE short readable headline.
- Do not add long text.
- Do not create tiny unreadable text.
- If text is used, it must be large, clean and high contrast.
- Avoid fake UI screens unless clearly useful.

DO NOT:
- no cartoonish stock illustration
- no generic corporate clipart
- no messy layout
- no random colors
- no overloaded Canva-style design
- no ugly typography

OUTPUT:
- square composition
- professional
- aesthetic
- ready for social media
`;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const base64 = image.data?.[0]?.b64_json;

    if (!base64) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
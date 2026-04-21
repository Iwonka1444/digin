import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
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

    const prompt = `
You are a world-class social media copywriter for ${brandProfile.company}.

Brand context:
- Industry: ${brandProfile.industry}
- Tone of voice: ${brandProfile.tone}
- Offer: ${brandProfile.offer}
- Target audience: ${brandProfile.audience}

Task: Write a ${type} post for ${platform}.
Topic: ${topic || "general brand promotion"}

Rules:
- NEVER start with "Are you..." or generic hooks
- Use a surprising, specific, or emotional opening line
- Make it feel written by a human, not AI
- Vary sentence length — mix short punchy lines with longer ones
- Platform style: ${
  platform === "Instagram" ? "visual, emotional, storytelling, emojis allowed" :
  platform === "LinkedIn" ? "professional but personal, insight-driven, no emojis" :
  "conversational, community-focused, relatable"
}
- Post type style: ${
  type === "Sales post" ? "create desire, show transformation, strong CTA" :
  type === "Educational" ? "teach one specific thing, give real value, end with insight" :
  "tell a real story with a beginning, tension, and resolution"
}

Tone: ${tone === "default" ? "use the brand tone of voice" : tone}
Length: ${
  length === "short" ? "maximum 3 lines, punchy and direct" :
  length === "long" ? "7-10 lines, detailed and rich" :
  "4-6 lines, balanced"
}

Structure:
1. Hook — first line must stop the scroll
2. Body — deliver the promise of the hook
3. CTA — one clear action
${includeHashtags ? "4. Hashtags — 5 relevant hashtags" : "No hashtags."}

Write only the post text. No explanations.
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    return NextResponse.json({ output: response.output_text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
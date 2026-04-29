import { NextResponse } from "next/server";
import OpenAI from "openai";

function extractJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { posts = [] } = await req.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "No posts provided" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Analyze the brand style based on these posts:

${posts.join("\n\n")}

Return ONLY valid JSON. No markdown. No explanation.

{
  "tone": "short description",
  "energy": "short description",
  "structure": "short description",
  "cta": "short description",
  "consistency": "short description",
  "language": "detected language",
  "avgLength": "short / medium / long",
  "usesEmoji": true,
  "dominantStyle": "short description",
  "score": 75,
  "mode": "shadow",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendation": "one practical recommendation"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a brand strategist. Return only valid JSON without markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const text = response.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(extractJson(text));

    return NextResponse.json({ brandDNA: parsed });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analyze failed" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, outputLang = "en" } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const langInstruction =
      outputLang === "nl"
        ? "Write your entire response in Dutch (Nederlands)."
        : outputLang === "pl"
        ? "Write your entire response in Polish (Polski)."
        : "Write your entire response in English.";

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an elite marketing strategist and copywriter with 15 years of experience working with small and medium businesses. You write copy that converts — not copy that sounds good. Every piece of content you create is specific, human, and results-focused. You never write generic marketing fluff. You think like a top agency but write like a real person. ${langInstruction}`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const output = response.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Generate prompt error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
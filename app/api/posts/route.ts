import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("generated_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { content, scheduled_for, media_url } = body;

    if (!content) return NextResponse.json({ error: "Content is required." }, { status: 400 });

    const { data, error } = await supabase
      .from("generated_posts")
      .insert([{
        user_id: user.id,
        content,
        scheduled_for: scheduled_for || null,
        media_url: media_url || null,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Post ID required." }, { status: 400 });

    const { error } = await supabase
      .from("generated_posts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/posts error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
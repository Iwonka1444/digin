"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BrandProfile = {
  company: string;
  industry: string;
  tone: string;
  offer: string;
  audience: string;
};

type GeneratedPost = {
  id: string;
  content: string;
  created_at: string;
  scheduled_for?: string | null;
};

type ViewType = "dashboard" | "generator" | "calendar" | "engagement" | "drafts";

type GeneratorForm = {
  platform: "Instagram" | "Facebook" | "LinkedIn";
  type: "Sales post" | "Educational" | "Storytelling";
  topic: string;
};

const NAV_ITEMS: { id: ViewType; label: string; hint: string }[] = [
  { id: "dashboard", label: "Dashboard", hint: "Overview & insights" },
  { id: "generator", label: "Generator", hint: "Create content" },
  { id: "calendar", label: "Calendar", hint: "Plan your week" },
  { id: "engagement", label: "Engagement", hint: "AI comment ideas" },
  { id: "drafts", label: "Drafts", hint: "Saved content" },
];

export default function DashboardPage() {
  const [view, setView] = useState<ViewType>("dashboard");
const [sidebarOpen, setSidebarOpen] = useState(false);

  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [savingToCalendar, setSavingToCalendar] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [generatorForm, setGeneratorForm] = useState<GeneratorForm>({
    platform: "Instagram",
    type: "Sales post",
    topic: "",
  });

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
const [includeHashtags, setIncludeHashtags] = useState(true);
const [tone, setTone] = useState("default");
const [length, setLength] = useState("medium");
  const [scheduledDate, setScheduledDate] = useState(() =>
    toDateTimeLocalString(new Date())
  );

  // ✅ Engagement state
const handleSignOut = async () => {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/login";
};
  const [engagementPost, setEngagementPost] = useState("");
  const [engagementContext, setEngagementContext] = useState("");
  const [engagementComments, setEngagementComments] = useState<string[]>([]);
  const [loadingEngagement, setLoadingEngagement] = useState(false);
  const [engagementError, setEngagementError] = useState("");

  async function loadProfile() {
    try {
      setLoadingProfile(true);
      setProfileError("");
      const res = await fetch("/api/profile", { method: "GET", cache: "no-store" });
      const contentType = res.headers.get("content-type") || "";
      let json: any = null;
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        setProfileError("Endpoint /api/profile nie zwrócił JSON.");
        return;
      }
      if (!res.ok) {
        setProfileError(json.error || "Nie udało się pobrać profilu.");
        return;
      }
      setBrandProfile(json.data);
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfileError("Błąd połączenia przy pobieraniu profilu.");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function loadPosts() {
    try {
      setLoadingPosts(true);
      setPostsError("");
      const res = await fetch("/api/posts", { method: "GET", cache: "no-store" });
      const contentType = res.headers.get("content-type") || "";
      let json: any = null;
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from /api/posts:", text);
        setPostsError("Endpoint /api/posts nie zwrócił JSON.");
        return;
      }
      if (!res.ok) {
        setPostsError(json.error || "Nie udało się pobrać postów.");
        return;
      }
      setPosts(json.data || []);
    } catch (error) {
      console.error("Posts fetch error:", error);
      setPostsError("Błąd połączenia przy pobieraniu historii postów.");
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, []);

  const handleGenerate = async () => {
    try {
      setLoadingGenerate(true);
      setGenerateError("");
      setGeneratedPost("");
      setCopyMessage("");
      setSaveMessage("");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...generatorForm, includeHashtags, tone, length }),
      });
      const contentType = res.headers.get("content-type") || "";
      let json: any = null;
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from /api/generate:", text);
        setGenerateError("Endpoint /api/generate nie zwrócił JSON.");
        return;
      }
      if (!res.ok) {
        setGenerateError(json.error || "Błąd generowania.");
        return;
      }
      if (json.output) {
        setGeneratedPost(json.output);
      } else {
        setGenerateError("Brak wygenerowanego tekstu.");
      }
    } catch (error) {
      console.error("Generate fetch error:", error);
      setGenerateError("Błąd połączenia z generatorem.");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSaveToCalendar = async () => {
    try {
      if (!generatedPost.trim()) {
        setGenerateError("Najpierw wygeneruj post.");
        return;
      }
      if (!scheduledDate) {
        setGenerateError("Ustaw datę i godzinę publikacji.");
        return;
      }
      setSavingToCalendar(true);
      setGenerateError("");
      setSaveMessage("");
      const scheduledForISO = new Date(scheduledDate).toISOString();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: generatedPost, scheduled_for: scheduledForISO }),
      });
      const contentType = res.headers.get("content-type") || "";
      let json: any = null;
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from POST /api/posts:", text);
        setGenerateError("Endpoint /api/posts nie zwrócił JSON.");
        return;
      }
      if (!res.ok) {
        setGenerateError(json.error || "Nie udało się zapisać posta.");
        return;
      }
      await loadPosts();
      const savedDate = new Date(scheduledForISO);
      setSelectedDate(savedDate);
      setCurrentMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
      setSaveMessage("Post zapisany do kalendarza ✅");
      setView("calendar");
    } catch (error) {
      console.error("Save to calendar error:", error);
      setGenerateError("Błąd przy zapisie do kalendarza.");
    } finally {
      setSavingToCalendar(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Skopiowano ✅");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      setCopyMessage("Nie udało się skopiować.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error("Delete error:", json.error);
        return;
      }
      await loadPosts();
    } catch (error) {
      console.error("Delete fetch error:", error);
    }
  };

  // ✅ Engagement handler
  const handleGenerateEngagement = async () => {
    try {
      setLoadingEngagement(true);
      setEngagementError("");
      setEngagementComments([]);
      const res = await fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: engagementPost,
          commentContext: engagementContext,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setEngagementError(json.error || "Błąd generowania komentarzy.");
        return;
      }
      setEngagementComments(json.comments || []);
    } catch (error) {
      console.error("Engagement fetch error:", error);
      setEngagementError("Błąd połączenia.");
    } finally {
      setLoadingEngagement(false);
    }
  };

  const stats = useMemo(() => {
    const scheduledCount = posts.filter((post) => post.scheduled_for).length;
    return {
      postsReady: posts.length,
      drafts: posts.length,
      ideas: posts.length + 6,
      channels: 3,
      scheduled: scheduledCount,
    };
  }, [posts]);

  const recentPosts = useMemo(() => posts.slice(0, 3), [posts]);

  const calendarDays = useMemo(() => {
    return buildCalendarDays(currentMonth);
  }, [currentMonth]);

  const postsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return posts.filter((post) => {
      if (!post.scheduled_for) return false;
      const postDate = new Date(post.scheduled_for);
      return isSameDay(postDate, selectedDate);
    });
  }, [posts, selectedDate]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-[290px] flex-col border-r border-black/5 bg-white/80 px-5 py-6 backdrop-blur-xl">
          <div className="mb-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
              D
            </div>
            <div className="mt-4">
              <h1 className="text-[22px] font-semibold tracking-tight">DiGin</h1>
              <p className="text-sm text-slate-500">AI Content Operating System</p>
            </div>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-black bg-black text-white shadow-sm"
                      : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`mt-1 text-xs ${active ? "text-white/70" : "text-slate-400"}`}>
                    {item.hint}
                  </div>
                </button>
              );
            })}
          </nav>
<button
  onClick={handleSignOut}
  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
>
  Sign out
</button>
          <div className="mt-8 rounded-3xl border border-black/5 bg-[#f7f4ef] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pro mode</p>
            <h3 className="mt-2 text-sm font-semibold leading-5">
              Turn one idea into multi-channel content
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Premium workflow for brand-first content creation.
            </p>
            <button
              onClick={() => setView("generator")}
              className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Open generator
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
{/* Mobile top bar */}
<div className="lg:hidden mb-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl">
  <div className="flex items-center gap-3">
    <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">☰</button>
    <span className="text-sm font-semibold">{getViewTitle(view)}</span>
  </div>
  <button onClick={() => setView("generator")} className="rounded-xl bg-black px-3 py-2 text-xs font-medium text-white">+ New post</button>
</div>

{/* Mobile sidebar overlay */}
{sidebarOpen && (
  <div className="lg:hidden fixed inset-0 z-50 flex">
    <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
    <aside className="relative z-10 w-[290px] bg-white px-5 py-6 overflow-y-auto">
      <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">✕</button>
      <div className="mb-8">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-sm">D</div>
        <div className="mt-4">
          <h1 className="text-[22px] font-semibold tracking-tight">DiGin</h1>
          <p className="text-sm text-slate-500">AI Content Operating System</p>
        </div>
      </div>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false); }} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${active ? "border-black bg-black text-white shadow-sm" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50"}`}>
              <div className="text-sm font-medium">{item.label}</div>
              <div className={`mt-1 text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{item.hint}</div>
            </button>
          );
        })}
      </nav>
      <button onClick={handleSignOut} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 transition">Sign out</button>
    </aside>
  </div>
)}
        <div className="hidden lg:flex mb-8 flex-col gap-4 rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{getViewTitle(view)}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your brand voice, generate content and keep drafts organized.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setView("generator")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                New post
              </button>
              <Link
                href="/edit-brand"
                className="rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white"
              >
                Edit brand
              </Link>
            </div>
          </div>

          {view === "dashboard" && (
            <div className="space-y-8">
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <StatCard title="Posts ready" value={String(stats.postsReady)} />
                <StatCard title="Drafts" value={String(stats.drafts)} />
                <StatCard title="Ideas" value={String(stats.ideas)} />
                <StatCard title="Channels" value={String(stats.channels)} />
                <StatCard title="Scheduled" value={String(stats.scheduled)} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI suggestion</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight">
                        Your next high-conversion content angle
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Suggested</span>
                  </div>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                    Build a trust-focused post around your offer, client results or a behind-the-scenes story
                    before the weekend. This usually performs well for local service brands.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setView("generator")}
                      className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
                    >
                      Generate now
                    </button>
                    <button
                      onClick={() => setView("calendar")}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      Open calendar
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Quick actions</p>
                  <div className="mt-4 grid gap-3">
                    <button
                      onClick={() => setView("generator")}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="text-sm font-medium">Create fresh draft</div>
                      <div className="mt-1 text-xs text-slate-400">Generate a new post in seconds</div>
                    </button>
                    <button
                      onClick={() => setView("drafts")}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="text-sm font-medium">Review saved drafts</div>
                      <div className="mt-1 text-xs text-slate-400">Copy, refine and reuse existing posts</div>
                    </button>
                    <button
                      onClick={() => setView("calendar")}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="text-sm font-medium">Plan weekly content</div>
                      <div className="mt-1 text-xs text-slate-400">Keep your publishing consistent</div>
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Brand profile</h3>
                    <Link href="/edit-brand" className="text-sm font-medium text-slate-500 hover:text-black">
                      Edit
                    </Link>
                  </div>
                  {loadingProfile && <p className="mt-4 text-sm text-slate-500">Loading profile...</p>}
                  {profileError && <p className="mt-4 text-sm text-red-600">{profileError}</p>}
                  {!loadingProfile && !profileError && (
                    <div className="mt-5 space-y-4 text-sm">
                      <ProfileRow label="Company" value={brandProfile?.company} />
                      <ProfileRow label="Industry" value={brandProfile?.industry} />
                      <ProfileRow label="Tone" value={brandProfile?.tone} />
                      <ProfileRow label="Offer" value={brandProfile?.offer} />
                      <ProfileRow label="Audience" value={brandProfile?.audience} />
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent drafts</h3>
                    <button
                      onClick={() => setView("drafts")}
                      className="text-sm font-medium text-slate-500 hover:text-black"
                    >
                      See all
                    </button>
                  </div>
                  {loadingPosts && <p className="mt-4 text-sm text-slate-500">Loading drafts...</p>}
                  {postsError && <p className="mt-4 text-sm text-red-600">{postsError}</p>}
                  {!loadingPosts && !postsError && recentPosts.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
                      No drafts yet. Generate your first premium content piece.
                    </div>
                  )}
                  <div className="mt-4 space-y-3">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {post.content}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400">
                              Created: {formatDateTime(post.created_at)}
                            </span>
                            {post.scheduled_for && (
                              <span className="text-xs text-slate-400">
                                Scheduled: {formatDateTime(post.scheduled_for)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopy(post.content)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {copyMessage && <p className="mt-4 text-sm text-green-600">{copyMessage}</p>}
                </div>
              </section>
            </div>
          )}

          {view === "generator" && (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Content setup</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">Create premium content</h3>
                </div>

                <label className="mb-2 block text-sm font-medium text-slate-700">Platform</label>
                <select
                  value={generatorForm.platform}
                  onChange={(e) =>
                    setGeneratorForm((prev) => ({ ...prev, platform: e.target.value as GeneratorForm["platform"] }))
                  }
                  className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
                >
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                </select>

                <label className="mb-2 block text-sm font-medium text-slate-700">Post type</label>
                <select
                  value={generatorForm.type}
                  onChange={(e) =>
                    setGeneratorForm((prev) => ({ ...prev, type: e.target.value as GeneratorForm["type"] }))
                  }
                  className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
                >
                  <option>Sales post</option>
                  <option>Educational</option>
                  <option>Storytelling</option>
                </select>

                <label className="mb-2 block text-sm font-medium text-slate-700">Topic</label>
                <input
                  value={generatorForm.topic}
                  onChange={(e) => setGeneratorForm((prev) => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g. spring offer, new product, client result"
                  className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
                />
<label className="mb-2 block text-sm font-medium text-slate-700">Tone</label>
<select
  value={tone}
  onChange={(e) => setTone(e.target.value)}
  className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
>
  <option value="default">Default (brand voice)</option>
  <option value="bold">Bold & confident</option>
  <option value="casual">Casual & friendly</option>
  <option value="funny">Funny & playful</option>
  <option value="formal">Formal & professional</option>
  <option value="inspiring">Inspiring & motivational</option>
</select>

<label className="mb-2 block text-sm font-medium text-slate-700">Post length</label>
<select
  value={length}
  onChange={(e) => setLength(e.target.value)}
  className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
>
  <option value="short">Short (1-3 lines)</option>
  <option value="medium">Medium (4-6 lines)</option>
  <option value="long">Long (7-10 lines)</option>
</select>
<div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
  <input
    type="checkbox"
    id="hashtags"
    checked={includeHashtags}
    onChange={(e) => setIncludeHashtags(e.target.checked)}
    className="h-4 w-4 rounded accent-black"
  />
  <label htmlFor="hashtags" className="text-sm font-medium text-slate-700 cursor-pointer">
    Include hashtags
  </label>
</div>

                <label className="mb-2 block text-sm font-medium text-slate-700">Scheduled date & time</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
                />

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current setup</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag>{generatorForm.platform}</Tag>
                    <Tag>{generatorForm.type}</Tag>
                    <Tag>{generatorForm.topic || "No topic yet"}</Tag>
                    <Tag>{scheduledDate ? formatDateTime(scheduledDate) : "No date yet"}</Tag>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loadingGenerate}
                  className="mt-6 w-full rounded-2xl bg-black py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingGenerate ? "Generating..." : "Generate content"}
                </button>

                {generateError && (
                  <p className="mt-4 whitespace-pre-wrap text-sm text-red-600">{generateError}</p>
                )}
                {copyMessage && <p className="mt-4 text-sm text-green-600">{copyMessage}</p>}
                {saveMessage && <p className="mt-4 text-sm text-green-600">{saveMessage}</p>}
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Output</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">Generated post</h3>
                  </div>
                  <button
                    onClick={() => setGeneratedPost("")}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
                  >
                    Clear
                  </button>
                </div>

                {!generatedPost && !loadingGenerate ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                    No content yet. Generate your first post to see the preview here.
                  </div>
                ) : loadingGenerate ? (
                  <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-10 text-sm text-slate-500">
                    Generating premium content...
                  </div>
                ) : (
                  <>
                    <div className="mt-6 rounded-3xl border border-slate-100 bg-[#fcfbf8] p-5">
                      <p className="mb-4 text-xs uppercase tracking-[0.18em] text-slate-400">Preview</p>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{generatedPost}</div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Publishing slot</p>
                      <p className="mt-2 text-sm text-slate-700">
                        {scheduledDate ? formatDateTime(scheduledDate) : "Choose date and time before saving"}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCopy(generatedPost)}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                      >
                        Copy
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={handleSaveToCalendar}
                        disabled={savingToCalendar}
                        className="rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingToCalendar ? "Saving..." : "Save to calendar"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {view === "calendar" && (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Publishing calendar</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{monthLabel}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date())}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-xs text-slate-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="px-2 py-3 text-center font-medium">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const isToday = day ? isSameDay(day, new Date()) : false;
                    const isSelected = day && selectedDate ? isSameDay(day, selectedDate) : false;
                    const hasPost =
                      !!day &&
                      posts.some((post) => {
                        if (!post.scheduled_for) return false;
                        return isSameDay(new Date(post.scheduled_for), day);
                      });

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!day) return;
                          setSelectedDate(day);
                          setScheduledDate(toDateTimeLocalString(day));
                        }}
                        disabled={!day}
                        className={`min-h-[96px] rounded-2xl border p-3 text-left transition ${
                          !day
                            ? "cursor-default border-transparent bg-transparent"
                            : isSelected
                            ? "border-black bg-black text-white shadow-sm"
                            : "border-slate-100 bg-slate-50/70 hover:bg-slate-100"
                        }`}
                      >
                        {day && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-700"}`}>
                                {day.getDate()}
                              </span>
                              {isToday && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? "bg-white/15 text-white" : "bg-black text-white"}`}>
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="mt-6">
                              {hasPost ? (
                                <div className={`inline-flex rounded-full px-2 py-1 text-[10px] ${isSelected ? "bg-white/15 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                                  Scheduled
                                </div>
                              ) : (
                                <div className={`text-[11px] ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                                  No post
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Selected day</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Choose a date"}
                </h3>

                <div className="mt-6 space-y-4">
                  {selectedDate && postsForSelectedDate.length > 0 ? (
                    postsForSelectedDate.map((post) => (
                      <div key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            {post.scheduled_for && (
                              <span className="text-xs text-slate-400">
                                Scheduled: {formatDateTime(post.scheduled_for)}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              Created: {formatDateTime(post.created_at)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopy(post.content)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
                      No content assigned to this day yet.
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (selectedDate) setScheduledDate(toDateTimeLocalString(selectedDate));
                      setView("generator");
                    }}
                    className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
                  >
                    Create new post
                  </button>
                  <button
                    onClick={() => setView("drafts")}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    Open drafts
                  </button>
                </div>

                {saveMessage && <p className="mt-4 text-sm text-green-600">{saveMessage}</p>}
              </div>
            </div>
          )}

          {/* ✅ ENGAGEMENT — AI */}
          {view === "engagement" && (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI engagement</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Generate comments</h3>

                <label className="mb-2 mt-6 block text-sm font-medium text-slate-700">
                  Post content (optional)
                </label>
                <textarea
                  value={engagementPost}
                  onChange={(e) => setEngagementPost(e.target.value)}
                  placeholder="Paste the post you want to comment on..."
                  rows={5}
                  className="mb-4 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
                />

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Context / comment angle
                </label>
                <input
                  value={engagementContext}
                  onChange={(e) => setEngagementContext(e.target.value)}
                  placeholder="e.g. thank you, question, compliment..."
                  className="mb-6 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
                />

                <button
                  onClick={handleGenerateEngagement}
                  disabled={loadingEngagement}
                  className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingEngagement ? "Generating..." : "Generate comments"}
                </button>

                {engagementError && (
                  <p className="mt-4 text-sm text-red-600">{engagementError}</p>
                )}
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Output</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Comment ideas</h3>

                {engagementComments.length === 0 && !loadingEngagement && (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                    No comments yet. Fill in the form and click Generate.
                  </div>
                )}

                {loadingEngagement && (
                  <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-10 text-sm text-slate-500">
                    Generating comment ideas...
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {engagementComments.map((comment, index) => (
                    <div key={index} className="rounded-3xl border border-slate-100 bg-[#fcfbf8] p-5">
                      <p className="text-sm leading-7 text-slate-700">{comment}</p>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleCopy(comment)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {copyMessage && <p className="mt-4 text-sm text-green-600">{copyMessage}</p>}
              </div>
            </div>
          )}

          {view === "drafts" && (
            <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Content library</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">Saved drafts</h3>
                </div>
                <button
                  onClick={() => setView("generator")}
                  className="rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white"
                >
                  New draft
                </button>
              </div>

              {loadingPosts && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                  Loading drafts...
                </div>
              )}
              {postsError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                  {postsError}
                </div>
              )}
              {!loadingPosts && !postsError && posts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
                  No drafts yet.
                </div>
              )}

              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="rounded-3xl border border-slate-100 bg-[#fcfbf8] p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{post.content}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">
                          Created: {formatDateTime(post.created_at)}
                        </span>
                        {post.scheduled_for && (
                          <span className="text-xs text-slate-400">
                            Scheduled: {formatDateTime(post.scheduled_for)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleCopy(post.content)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedPost(post.content);
                            setScheduledDate(
                              post.scheduled_for
                                ? toDateTimeLocalString(new Date(post.scheduled_for))
                                : toDateTimeLocalString(new Date())
                            );
                            setView("generator");
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          Open in generator
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {copyMessage && <p className="mt-4 text-sm text-green-600">{copyMessage}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-white/70 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-700">{value || "Brak danych"}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
      {children}
    </span>
  );
}

function getViewTitle(view: ViewType) {
  switch (view) {
    case "dashboard": return "Content dashboard";
    case "generator": return "AI content generator";
    case "calendar": return "Content calendar";
    case "engagement": return "Engagement assistant";
    case "drafts": return "Draft manager";
    default: return "Dashboard";
  }
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function buildCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const jsDay = firstDay.getDay();
  const mondayBasedStart = (jsDay + 6) % 7;
  const days: Array<Date | null> = [];
  for (let i = 0; i < mondayBasedStart; i++) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function toDateTimeLocalString(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
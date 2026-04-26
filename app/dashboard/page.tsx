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
  media_url?: string | null;
};

type ViewType = "dashboard" | "generator" | "calendar" | "engagement" | "drafts";

type GeneratorForm = {
  platform: "Instagram" | "Facebook" | "LinkedIn";
  type: "Sales post" | "Educational" | "Storytelling";
  topic: string;
};

// Growth system
const GROWTH_LEVELS = [
  { level: 1, name: "Seed stage", emoji: "🌱", icon: "🌱", postsNeeded: 2, description: "You're just getting started." },
  { level: 2, name: "Sprout stage", emoji: "🌿", icon: "🌿", postsNeeded: 5, description: "You're growing steadily!" },
  { level: 3, name: "Small plant", emoji: "🪴", icon: "🪴", postsNeeded: 10, description: "Looking good, keep going!" },
  { level: 4, name: "Growing plant", emoji: "🌳", icon: "🌳", postsNeeded: 20, description: "Your brand is thriving!" },
  { level: 5, name: "Strong plant", emoji: "🌲", icon: "🌲", postsNeeded: 35, description: "You're a content machine!" },
  { level: 6, name: "Bloom", emoji: "🌸", icon: "🌸", postsNeeded: 50, description: "Full bloom! You've made it!" },
];

function getGrowthLevel(totalPosts: number) {
  for (let i = GROWTH_LEVELS.length - 1; i >= 0; i--) {
    if (totalPosts >= GROWTH_LEVELS[i].postsNeeded) {
      return GROWTH_LEVELS[Math.min(i + 1, GROWTH_LEVELS.length - 1)];
    }
  }
  return GROWTH_LEVELS[0];
}

function getProgressToNext(totalPosts: number) {
  const currentIdx = GROWTH_LEVELS.findIndex((l, i) => {
    const next = GROWTH_LEVELS[i + 1];
    return !next || totalPosts < next.postsNeeded;
  });
  const current = GROWTH_LEVELS[Math.max(0, currentIdx)];
  const next = GROWTH_LEVELS[Math.min(currentIdx + 1, GROWTH_LEVELS.length - 1)];
  if (current === next) return { progress: 100, postsLeft: 0, nextLevel: current };
  const progress = Math.round(((totalPosts - current.postsNeeded) / (next.postsNeeded - current.postsNeeded)) * 100);
  return { progress: Math.max(0, Math.min(100, progress)), postsLeft: next.postsNeeded - totalPosts, nextLevel: next };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getPlatformIcon(post: GeneratedPost) {
  const content = post.content.toLowerCase();
  if (content.includes("linkedin")) return "💼";
  if (content.includes("facebook")) return "📘";
  return "📸";
}

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
  const [scheduledDate, setScheduledDate] = useState(() => toDateTimeLocalString(new Date()));

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [engagementPost, setEngagementPost] = useState("");
  const [engagementContext, setEngagementContext] = useState("");
  const [engagementComments, setEngagementComments] = useState<string[]>([]);
  const [loadingEngagement, setLoadingEngagement] = useState(false);
  const [engagementError, setEngagementError] = useState("");

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  async function loadProfile() {
    try {
      setLoadingProfile(true);
      setProfileError("");
      const res = await fetch("/api/profile", { method: "GET", cache: "no-store" });
      const contentType = res.headers.get("content-type") || "";
      let json: any = null;
      if (contentType.includes("application/json")) json = await res.json();
      else { setProfileError("Profile endpoint error."); return; }
      if (!res.ok) { setProfileError(json.error || "Failed to load profile."); return; }
      if (!json.data) {
        window.location.href = "/onboarding";
        return;
      }
      setBrandProfile(json.data);
    } catch { setProfileError("Connection error."); }
    finally { setLoadingProfile(false); }
  }

  async function loadPosts() {
    try {
      setLoadingPosts(true);
      setPostsError("");
      const res = await fetch("/api/posts", { method: "GET", cache: "no-store" });
      const contentType = res.headers.get("content-type") || "";
      let json: any = null;
      if (contentType.includes("application/json")) json = await res.json();
      else { setPostsError("Posts endpoint error."); return; }
      if (!res.ok) { setPostsError(json.error || "Failed to load posts."); return; }
      setPosts(json.data || []);
    } catch { setPostsError("Connection error."); }
    finally { setLoadingPosts(false); }
  }

  useEffect(() => { loadProfile(); loadPosts(); }, []);

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
      const json = await res.json();
      if (!res.ok) { setGenerateError(json.error || "Generation error."); return; }
      if (json.output) setGeneratedPost(json.output);
      else setGenerateError("No output from model.");
    } catch { setGenerateError("Connection error."); }
    finally { setLoadingGenerate(false); }
  };

  const handleSaveToCalendar = async () => {
    try {
      if (!generatedPost.trim()) { setGenerateError("Generate a post first."); return; }
      if (!scheduledDate) { setGenerateError("Set a date first."); return; }
      setSavingToCalendar(true);
      setGenerateError("");
      setSaveMessage("");

      let finalMediaUrl = mediaUrl;
      if (mediaFile) {
        setUploadingMedia(true);
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const fileName = `${Date.now()}-${mediaFile.name}`;
        const { data, error } = await supabase.storage
          .from("post-media")
          .upload(fileName, mediaFile);
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("post-media")
            .getPublicUrl(data.path);
          finalMediaUrl = urlData.publicUrl;
          setMediaUrl(finalMediaUrl);
        }
        setUploadingMedia(false);
      }

      const scheduledForISO = new Date(scheduledDate).toISOString();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: generatedPost, scheduled_for: scheduledForISO, media_url: finalMediaUrl }),
      });
      const json = await res.json();
      if (!res.ok) { setGenerateError(json.error || "Failed to save."); return; }
      await loadPosts();
      const savedDate = new Date(scheduledForISO);
      setSelectedDate(savedDate);
      setCurrentMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
      setSaveMessage("Post saved to calendar ✅");
      setView("calendar");
    } catch { setGenerateError("Connection error."); }
    finally { setSavingToCalendar(false); }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied ✅");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch { setCopyMessage("Failed to copy."); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) { console.error("Delete error:", json.error); return; }
      await loadPosts();
    } catch { console.error("Delete error"); }
  };

  const handleGenerateEngagement = async () => {
    try {
      setLoadingEngagement(true);
      setEngagementError("");
      setEngagementComments([]);
      const res = await fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postContent: engagementPost, commentContext: engagementContext }),
      });
      const json = await res.json();
      if (!res.ok) { setEngagementError(json.error || "Error generating comments."); return; }
      setEngagementComments(json.comments || []);
    } catch { setEngagementError("Connection error."); }
    finally { setLoadingEngagement(false); }
  };

  const stats = useMemo(() => {
    const scheduledCount = posts.filter((p) => p.scheduled_for).length;
    return { postsReady: posts.length, drafts: posts.length, scheduled: scheduledCount };
  }, [posts]);

  const recentPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const postsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return posts.filter((p) => p.scheduled_for && isSameDay(new Date(p.scheduled_for), selectedDate));
  }, [posts, selectedDate]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const growthLevel = useMemo(() => getGrowthLevel(posts.length), [posts.length]);
  const growthProgress = useMemo(() => getProgressToNext(posts.length), [posts.length]);

  const greeting = getGreeting();
  const userName = brandProfile?.company || "there";

  // ── SIDEBAR CONTENT ──────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white text-lg font-bold shadow-sm">
          D
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">DiGin</h1>
          <p className="text-xs text-slate-400">AI Marketing Assistant</p>
        </div>
      </div>

      <nav className="space-y-1">
        {[
          { id: "dashboard" as ViewType, label: "Home", icon: "🏠" },
          { id: "generator" as ViewType, label: "Generator", icon: "✨" },
          { id: "calendar" as ViewType, label: "Calendar", icon: "📅" },
          { id: "engagement" as ViewType, label: "Engagement", icon: "💬" },
          { id: "drafts" as ViewType, label: "Drafts", icon: "📝" },
        ].map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                active ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Your Growth</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl">{growthLevel.icon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{growthLevel.name}</p>
            <p className="text-xs text-emerald-600">Level {GROWTH_LEVELS.indexOf(growthLevel) + 1}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-emerald-100">
          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${growthProgress.progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {growthProgress.postsLeft > 0 ? `${growthProgress.postsLeft} more posts to grow!` : "Max level reached! 🎉"}
        </p>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-4 w-full flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
      >
        <span>👋</span> Sign out
      </button>
    </>
  );

  // ── BOTTOM NAV (mobile) ───────────────────────────────────────────
  const BottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {[
          { id: "dashboard" as ViewType, label: "Home", icon: "🏠" },
          { id: "calendar" as ViewType, label: "Calendar", icon: "📅" },
          { id: "drafts" as ViewType, label: "Drafts", icon: "📝" },
          { id: "engagement" as ViewType, label: "Engage", icon: "💬" },
        ].map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-medium ${active ? "text-emerald-600" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setView("generator")}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg -mt-4"
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      <div className="flex min-h-screen">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-[260px] flex-col border-r border-slate-100 bg-white px-5 py-6">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-10 w-[260px] bg-white px-5 py-6 overflow-y-auto">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl"
              >✕</button>
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* ── DASHBOARD VIEW ── */}
          {view === "dashboard" && (
            <div className="p-4 lg:p-8 space-y-5 max-w-2xl mx-auto lg:max-w-none">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    {greeting}, {userName}! 👋
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Let's grow your brand today.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                    🔔
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                  >☰</button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView("generator")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition"
                >
                  ✨ Generate now
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  📅 Open calendar
                </button>
              </div>

              {/* Quick actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick actions</p>
                  <button className="text-xs text-emerald-600 font-medium">See all →</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Create fresh draft", icon: "✏️", hint: "Generate a new post in seconds", action: () => setView("generator") },
                    { label: "Review saved drafts", icon: "📄", hint: "Copy, refine and reuse existing posts", action: () => setView("drafts") },
                    { label: "Plan weekly content", icon: "📅", hint: "Keep your publishing consistent", action: () => setView("calendar") },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-emerald-200 hover:shadow-sm transition"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{item.label}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400 leading-tight hidden sm:block">{item.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Your Growth */}
              <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your growth</p>
                      <p className="text-base font-semibold text-slate-800 line-clamp-1">
                        {growthLevel.name} {growthLevel.emoji}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">{growthLevel.description}</p>
                      {growthProgress.postsLeft > 0 && (
                        <p className="mt-1 text-sm font-semibold text-emerald-600">
                          {growthProgress.postsLeft} more post{growthProgress.postsLeft !== 1 ? "s" : ""} to grow! 🌱
                        </p>
                      )}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-500">{posts.length} / {growthProgress.nextLevel.postsNeeded} posts this week</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${growthProgress.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Next milestone: {growthProgress.nextLevel.name} {growthProgress.nextLevel.emoji}</p>
                      </div>
                    </div>
                    <div className="flex h-24 w-24 items-center justify-center text-6xl ml-4 shrink-0">
                      {growthLevel.emoji}
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-50 bg-emerald-50/50 px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{posts.length}</p>
                      <p className="text-xs text-slate-500">Posts</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{stats.scheduled}</p>
                      <p className="text-xs text-slate-500">Scheduled</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">Lv.{GROWTH_LEVELS.indexOf(growthLevel) + 1}</p>
                      <p className="text-xs text-slate-500">Level</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent drafts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent drafts</p>
                  <button onClick={() => setView("drafts")} className="text-xs text-emerald-600 font-medium">See all →</button>
                </div>

                {loadingPosts && (
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-400">Loading...</div>
                )}

                {!loadingPosts && recentPosts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                    <p className="text-2xl mb-2">🌱</p>
                    <p className="text-sm text-slate-400">No drafts yet. Generate your first post!</p>
                    <button
                      onClick={() => setView("generator")}
                      className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Generate now
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {recentPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setView("drafts")}
                      className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-emerald-200 hover:shadow-sm transition"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-2xl overflow-hidden">
                        {post.media_url ? (
                          <img src={post.media_url} alt="media" className="h-full w-full object-cover" />
                        ) : (
                          getPlatformIcon(post)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{post.content.split("\n")[0] || "Draft post"}</p>
                        <p className="mt-0.5 text-xs text-emerald-600 font-medium">Draft</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">{formatDate(post.created_at)}</p>
                        <p className="text-slate-300 text-sm">›</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand profile quick view */}
              {brandProfile && (
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Brand profile</p>
                    <Link href="/edit-brand" className="text-xs text-emerald-600 font-medium">Edit →</Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brandProfile.company && <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{brandProfile.company}</span>}
                    {brandProfile.industry && <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs text-slate-600">{brandProfile.industry}</span>}
                    {brandProfile.tone && <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs text-slate-600">{brandProfile.tone}</span>}
                  </div>
                </div>
              )}

              {!brandProfile && !loadingProfile && (
                <Link
                  href="/edit-brand"
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition"
                >
                  <span className="text-2xl">🧠</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Set up your brand profile</p>
                    <p className="text-xs text-emerald-600">Help AI understand your brand for better content</p>
                  </div>
                  <span className="ml-auto text-emerald-500">›</span>
                </Link>
              )}
            </div>
          )}

          {/* ── GENERATOR VIEW ── */}
          {view === "generator" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView("dashboard")} className="lg:hidden text-slate-400 hover:text-slate-600">‹</button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">AI Content Generator</h2>
                  <p className="text-sm text-slate-500">Create posts tailored to your brand</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Content setup</p>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Platform</label>
                  <select
                    value={generatorForm.platform}
                    onChange={(e) => setGeneratorForm((p) => ({ ...p, platform: e.target.value as GeneratorForm["platform"] }))}
                    className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>LinkedIn</option>
                  </select>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Post type</label>
                  <select
                    value={generatorForm.type}
                    onChange={(e) => setGeneratorForm((p) => ({ ...p, type: e.target.value as GeneratorForm["type"] }))}
                    className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  >
                    <option>Sales post</option>
                    <option>Educational</option>
                    <option>Storytelling</option>
                  </select>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Topic</label>
                  <input
                    value={generatorForm.topic}
                    onChange={(e) => setGeneratorForm((p) => ({ ...p, topic: e.target.value }))}
                    placeholder="e.g. spring offer, new product, client result"
                    className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  />

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  >
                    <option value="default">Default (brand voice)</option>
                    <option value="bold">Bold & confident</option>
                    <option value="casual">Casual & friendly</option>
                    <option value="funny">Funny & playful</option>
                    <option value="formal">Formal & professional</option>
                    <option value="inspiring">Inspiring & motivational</option>
                  </select>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  >
                    <option value="short">Short (1-3 lines)</option>
                    <option value="medium">Medium (4-6 lines)</option>
                    <option value="long">Long (7-10 lines)</option>
                  </select>

                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      id="hashtags"
                      checked={includeHashtags}
                      onChange={(e) => setIncludeHashtags(e.target.checked)}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    <label htmlFor="hashtags" className="text-sm font-medium text-slate-700 cursor-pointer">Include hashtags</label>
                  </div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Scheduled date & time</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="mb-5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition"
                  />

                  <button
                    onClick={handleGenerate}
                    disabled={loadingGenerate}
                    className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingGenerate ? "Generating..." : "✨ Generate content"}
                  </button>

                  {generateError && <p className="mt-3 text-sm text-red-500">{generateError}</p>}
                  {copyMessage && <p className="mt-3 text-sm text-emerald-600">{copyMessage}</p>}
                  {saveMessage && <p className="mt-3 text-sm text-emerald-600">{saveMessage}</p>}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Output</p>
                      <h3 className="text-lg font-bold text-slate-900">Generated post</h3>
                    </div>
                    {generatedPost && (
                      <button onClick={() => setGeneratedPost("")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">
                        Clear
                      </button>
                    )}
                  </div>

                  {!generatedPost && !loadingGenerate && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      <span className="text-4xl mb-3">✨</span>
                      <p className="text-sm text-slate-400">No content yet. Hit generate to see your post here.</p>
                    </div>
                  )}

                  {loadingGenerate && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center">
                      <span className="text-4xl mb-3 animate-bounce">🌱</span>
                      <p className="text-sm text-emerald-600 font-medium">Growing your content...</p>
                    </div>
                  )}

                  {generatedPost && !loadingGenerate && (
                    <>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Preview</p>
                        <textarea
                          value={generatedPost}
                          onChange={(e) => setGeneratedPost(e.target.value)}
                          className="w-full resize-none rounded-xl bg-transparent text-sm leading-7 text-slate-800 outline-none min-h-[120px]"
                          rows={6}
                        />
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-3 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Publishing slot</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">{scheduledDate ? formatDateTime(scheduledDate) : "No date set"}</p>
                      </div>

                      {/* ✅ NAPRAWIONY media upload */}
                      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-600 mb-2">📎 Add media (optional)</p>
                        {mediaUrl && (
                          <img src={mediaUrl} alt="preview" className="w-full rounded-lg mb-2 max-h-40 object-cover" />
                        )}
                        {mediaFile && !mediaUrl && (
                          <p className="text-xs text-slate-500 mb-2">📄 {mediaFile.name}</p>
                        )}
                        <input
                          type="file"
                          accept="image/*,video/*"
onChange={(e) => {
  const file = e.target.files?.[0];
  if (file) {
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
}}
                          className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-700"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCopy(generatedPost)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Copy</button>
                        <button onClick={handleGenerate} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Regenerate</button>
                        <button
                          onClick={handleSaveToCalendar}
                          disabled={savingToCalendar || uploadingMedia}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {savingToCalendar || uploadingMedia ? "Saving..." : "Save to calendar"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CALENDAR VIEW ── */}
          {view === "calendar" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Content Calendar</h2>
                  <p className="text-sm text-slate-500">Plan and schedule your posts</p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{monthLabel}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">‹</button>
                      <button onClick={() => setCurrentMonth(new Date())} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Today</button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">›</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={i} className="py-2 text-center text-xs font-semibold text-slate-400">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isToday = day ? isSameDay(day, new Date()) : false;
                      const isSelected = day && selectedDate ? isSameDay(day, selectedDate) : false;
                      const hasPost = !!day && posts.some((p) => p.scheduled_for && isSameDay(new Date(p.scheduled_for), day));

                      return (
                        <button
                          key={index}
                          onClick={() => { if (!day) return; setSelectedDate(day); setScheduledDate(toDateTimeLocalString(day)); }}
                          disabled={!day}
                          className={`relative min-h-[48px] rounded-xl p-1.5 text-left transition ${
                            !day ? "cursor-default" :
                            isSelected ? "bg-emerald-500 text-white shadow-sm" :
                            isToday ? "bg-emerald-50 border border-emerald-200" :
                            "border border-transparent hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {day && (
                            <>
                              <span className={`text-xs font-medium ${isSelected ? "text-white" : isToday ? "text-emerald-700" : "text-slate-700"}`}>
                                {day.getDate()}
                              </span>
                              {hasPost && (
                                <div className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Selected day</p>
                  <h3 className="font-bold text-slate-900 mb-4">
                    {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Choose a date"}
                  </h3>

                  {postsForSelectedDate.length > 0 ? (
                    <div className="space-y-3">
                      {postsForSelectedDate.map((post) => (
                        <div key={post.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          {post.media_url && (
  <img
    src={post.media_url}
    alt="media"
    className="w-full rounded-xl mb-3 max-h-48 object-cover cursor-pointer hover:max-h-96 transition-all duration-300"
    onClick={(e) => {
      const img = e.currentTarget;
      if (img.classList.contains("max-h-48")) {
        img.classList.remove("max-h-48");
        img.classList.add("max-h-screen");
      } else {
        img.classList.remove("max-h-screen");
        img.classList.add("max-h-48");
      }
    }}
  />
)}
                          )}
                          <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => handleCopy(post.content)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-white">Copy</button>
                            <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                      <p className="text-sm text-slate-400">No posts for this day</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { if (selectedDate) setScheduledDate(toDateTimeLocalString(selectedDate)); setView("generator"); }}
                      className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      + Create post
                    </button>
                    <button onClick={() => setView("drafts")} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Drafts</button>
                  </div>

                  {saveMessage && <p className="mt-3 text-sm text-emerald-600">{saveMessage}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── ENGAGEMENT VIEW ── */}
          {view === "engagement" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">AI Engagement</h2>
                  <p className="text-sm text-slate-500">Generate human-sounding comments</p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Post content (optional)</label>
                  <textarea
                    value={engagementPost}
                    onChange={(e) => setEngagementPost(e.target.value)}
                    placeholder="Paste the post you want to comment on..."
                    rows={5}
                    className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition"
                  />
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Context / comment angle</label>
                  <input
                    value={engagementContext}
                    onChange={(e) => setEngagementContext(e.target.value)}
                    placeholder="e.g. thank you, question, compliment..."
                    className="mb-5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition"
                  />
                  <button
                    onClick={handleGenerateEngagement}
                    disabled={loadingEngagement}
                    className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {loadingEngagement ? "Generating..." : "💬 Generate comments"}
                  </button>
                  {engagementError && <p className="mt-3 text-sm text-red-500">{engagementError}</p>}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Output</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Comment ideas</h3>

                  {engagementComments.length === 0 && !loadingEngagement && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      <span className="text-4xl mb-3">💬</span>
                      <p className="text-sm text-slate-400">Fill in the form and click Generate.</p>
                    </div>
                  )}

                  {loadingEngagement && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center">
                      <span className="text-4xl mb-3 animate-bounce">💭</span>
                      <p className="text-sm text-emerald-600">Crafting comments...</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {engagementComments.map((comment, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-700 leading-6">{comment}</p>
                        <div className="mt-2 flex justify-end">
                          <button onClick={() => handleCopy(comment)} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Copy</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {copyMessage && <p className="mt-3 text-sm text-emerald-600">{copyMessage}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── DRAFTS VIEW ── */}
          {view === "drafts" && (
            <div className="p-4 lg:p-8 max-w-2xl mx-auto lg:max-w-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setView("dashboard")} className="lg:hidden text-slate-400">‹</button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Saved Drafts</h2>
                    <p className="text-sm text-slate-500">Your content library</p>
                  </div>
                </div>
                <button
                  onClick={() => setView("generator")}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  + New draft
                </button>
              </div>

              {loadingPosts && <div className="rounded-2xl bg-white border border-slate-100 p-4 text-sm text-slate-400">Loading...</div>}
              {postsError && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-500">{postsError}</div>}

              {!loadingPosts && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                  <span className="text-5xl mb-4">📝</span>
                  <p className="text-slate-500 mb-4">No drafts yet. Create your first post!</p>
                  <button onClick={() => setView("generator")} className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">Generate now</button>
                </div>
              )}

              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                   {post.media_url && (
  <img
    src={post.media_url}
    alt="media"
    className="w-full rounded-xl mb-3 max-h-48 object-cover cursor-pointer"
    onClick={() => setLightboxUrl(post.media_url ?? null)}
  />
)}
                    <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-xs text-slate-400">Created: {formatDateTime(post.created_at)}</span>
                        {post.scheduled_for && (
                          <span className="ml-3 text-xs text-emerald-600">📅 {formatDateTime(post.scheduled_for)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(post.content)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Copy</button>
                        <button
                          onClick={() => { setGeneratedPost(post.content); setScheduledDate(post.scheduled_for ? toDateTimeLocalString(new Date(post.scheduled_for)) : toDateTimeLocalString(new Date())); setView("generator"); }}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >Edit</button>
                        <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {copyMessage && <p className="mt-4 text-sm text-emerald-600">{copyMessage}</p>}
            </div>
          )}

        </main>
      </div>

      {/* Bottom navigation */}
{lightboxUrl && (
  <div
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    onClick={() => setLightboxUrl(null)}
  >
    <img
      src={lightboxUrl}
      alt="full"
      className="max-w-full max-h-full rounded-2xl object-contain"
    />
  </div>
)}
      <BottomNav />
    </div>
  );
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
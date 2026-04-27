"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

type ViewType = "dashboard" | "generator" | "calendar" | "engagement" | "drafts" | "brandlab";

type GeneratorForm = {
  platform: "Instagram" | "Facebook" | "LinkedIn";
  type: "Sales post" | "Educational" | "Storytelling";
  topic: string;
};

type BrandDNA = {
  tone: string;
  energy: string;
  structure: string;
  cta: string;
  consistency: string;
  language: string;
  avgLength: string;
  usesEmoji: boolean;
  dominantStyle: string;
  score: number;
  mode: "shadow" | "upgrade";
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

type RewriteVariant = {
  label: string;
  description: string;
  content: string;
};

// ─── Growth Levels 0–7 ───────────────────────────────────────────────────────

const GROWTH_LEVELS = [
  { level: 0, name: "Nasionko",        emoji: "🌰", description: "Twoja marka czeka, żeby zakiełkować." },
  { level: 1, name: "Kiełek",          emoji: "🌱", description: "Pierwsza iskra — zaczynasz!" },
  { level: 2, name: "Mała roślina",    emoji: "🪴", description: "Twoja marka ma już swój głos." },
  { level: 3, name: "Pierwsze liście", emoji: "🌿", description: "Pierwszy post gotowy do świata." },
  { level: 4, name: "Zdrowa roślina",  emoji: "🌳", description: "Budujesz rytm, krok po kroku." },
  { level: 5, name: "Pąki",           emoji: "🌸", description: "Tydzień treści zaplanowany!" },
  { level: 6, name: "Kwiat",          emoji: "🌺", description: "Twoja marka zaczyna rozmawiać." },
  { level: 7, name: "Ogród marki",    emoji: "🌻", description: "Pierwsza kampania. Brawo!" },
];

// ─── Challenges ───────────────────────────────────────────────────────────────

type Challenge = {
  id: string;
  label: string;
  hint: string;
  action?: ViewType;
  check: (posts: GeneratedPost[], profile: BrandProfile | null, ui: Set<string>) => boolean;
};

type LevelData = {
  title: string;
  subtitle: string;
  reward: string;
  encouragement: string;
  challenges: Challenge[];
};

const LEVEL_DATA: Record<number, LevelData> = {
  0: {
    title: "Level 0 — Poznaj swoją markę",
    subtitle: "Zacznij lekko. Żadnej presji.",
    reward: "Twoja marka została zasadzona 🌰",
    encouragement: "Mały krok = progres. To wystarczy na dziś.",
    challenges: [
      { id: "c_company",  label: "Wpisz nazwę firmy",           hint: "Jak się nazywa Twoja marka?",       action: "dashboard", check: (_, p) => !!p?.company },
      { id: "c_industry", label: "Wybierz branżę",              hint: "W jakiej dziedzinie działasz?",     action: "dashboard", check: (_, p) => !!p?.industry },
      { id: "c_tone",     label: "Wybierz ton komunikacji",     hint: "Jak mówi Twoja marka?",             action: "dashboard", check: (_, p) => !!p?.tone },
      { id: "c_offer",    label: "Opisz ofertę jednym zdaniem", hint: "Co oferujesz swoim klientom?",      action: "dashboard", check: (_, p) => !!p?.offer },
      { id: "c_audience", label: "Opisz swojego klienta",       hint: "Do kogo kierujesz swoją markę?",   action: "dashboard", check: (_, p) => !!p?.audience },
    ],
  },
  1: {
    title: "Level 1 — Pierwsza iskra",
    subtitle: "Dziś nie publikujesz — tylko piszesz. Bez presji.",
    reward: "Masz pierwszy szkic. DiGin zaczyna rosnąć 🌱",
    encouragement: "Dzisiaj wystarczy jeden draft.",
    challenges: [
      { id: "c_platform", label: "Wybierz platformę",           hint: "Instagram, Facebook czy LinkedIn?",            action: "generator", check: (_, __, ui) => ui.has("platform_chosen") },
      { id: "c_generate", label: "Wygeneruj pierwszy pomysł",   hint: "Nie musi być idealny — po prostu zacznij",     action: "generator", check: (posts) => posts.length >= 1 },
      { id: "c_draft",    label: "Zapisz pierwszy draft",       hint: "Kliknij 'Zapisz do kalendarza'",              action: "generator", check: (posts) => posts.length >= 1 },
    ],
  },
  2: {
    title: "Level 2 — Głos marki",
    subtitle: "Czas znaleźć styl, który pasuje właśnie do Ciebie.",
    reward: "Twoja marka ma już swój głos 🪴",
    encouragement: "Nie musisz robić wszystkiego dziś.",
    challenges: [
      { id: "c_variants", label: "Wypróbuj 3 różne warianty posta",      hint: "Zmień ton lub typ i kliknij Generuj ponownie",  action: "generator", check: (_, __, ui) => ui.has("three_variants") },
      { id: "c_posts3",   label: "Zapisz 3 drafty do biblioteki",         hint: "Buduj swoją bibliotekę treści",                 action: "generator", check: (posts) => posts.length >= 3 },
      { id: "c_dna",      label: "Przeanalizuj DNA swojej marki",         hint: "Wejdź w Brand Lab i wklej swoje posty",         action: "brandlab",  check: (_, __, ui) => ui.has("dna_analyzed") },
    ],
  },
  3: {
    title: "Level 3 — Pierwszy post",
    subtitle: "Mały, realny krok. Jeden post gotowy do świata.",
    reward: "Pierwszy post gotowy 🌿",
    encouragement: "Jeden post to już wystarczająco dużo.",
    challenges: [
      { id: "c_schedule1", label: "Wybierz godzinę publikacji",  hint: "Zaplanuj kiedy post ma wyjść",               action: "calendar",  check: (posts) => posts.filter((p) => p.scheduled_for).length >= 1 },
      { id: "c_media",     label: "Dodaj zdjęcie do posta",      hint: "Posty ze zdjęciem mają 2x więcej zasięgów",  action: "generator", check: (posts) => posts.some((p) => !!p.media_url) },
      { id: "c_rewrite",   label: "Użyj 'Rewrite me better'",    hint: "Brand Lab → wklej post → 3 wersje",          action: "brandlab",  check: (_, __, ui) => ui.has("rewrite_used") },
    ],
  },
  4: {
    title: "Level 4 — Mini rutyna",
    subtitle: "Nie codziennie. 2 małe kroki w tygodniu wystarczą.",
    reward: "Budujesz rytm. Brawo! 🌳",
    encouragement: "Twoja marka chwilę odpoczywa? Wróć z jednym małym krokiem.",
    challenges: [
      { id: "c_posts6",  label: "Przygotuj 6 postów w bibliotece",  hint: "Materiał na 3 tygodnie przy 2 postach/tydzień",  action: "generator", check: (posts) => posts.length >= 6 },
      { id: "c_edu",     label: "Wygeneruj post edukacyjny",         hint: "Typ 'Educational' — ucz i buduj autorytet",      action: "generator", check: (_, __, ui) => ui.has("educational_generated") },
      { id: "c_sales",   label: "Wygeneruj post sprzedażowy",        hint: "Typ 'Sales post' — pokaż co oferujesz",          action: "generator", check: (_, __, ui) => ui.has("sales_generated") },
    ],
  },
  5: {
    title: "Level 5 — Content Week",
    subtitle: "Zaplanuj cały tydzień. Poczujesz kontrolę.",
    reward: "Twój tydzień marketingowy gotowy 🌸",
    encouragement: "Nakarm swoją markę jednym małym krokiem.",
    challenges: [
      { id: "c_sched3",  label: "Zaplanuj 3 posty w kalendarzu",   hint: "Rozkładaj posty na różne dni",             action: "calendar",  check: (posts) => posts.filter((p) => p.scheduled_for).length >= 3 },
      { id: "c_posts10", label: "Osiągnij 10 postów w bibliotece", hint: "Regularność buduje markę",                 action: "generator", check: (posts) => posts.length >= 10 },
      { id: "c_story",   label: "Opowiedz historię marki",         hint: "Typ 'Storytelling' — ludzie kupują od ludzi", action: "generator", check: (_, __, ui) => ui.has("storytelling_generated") },
    ],
  },
  6: {
    title: "Level 6 — Engagement",
    subtitle: "Nie tylko publikujesz — zaczynasz rozmawiać.",
    reward: "Twoja marka zaczyna rozmawiać 🌺",
    encouragement: "Mały krok = progres. Jeden komentarz zmienia dużo.",
    challenges: [
      { id: "c_engage1", label: "Wygeneruj komentarze do postów",  hint: "Skorzystaj z narzędzia Engagement",         action: "engagement", check: (_, __, ui) => ui.has("engagement_used") },
      { id: "c_engage2", label: "Wygeneruj pomysły na odpowiedzi", hint: "Reagowanie u innych buduje zasięg",          action: "engagement", check: (_, __, ui) => ui.has("engagement_ideas") },
      { id: "c_sched5",  label: "Miej 5 postów zaplanowanych",     hint: "Stały rytm = rosnąca marka",                action: "calendar",   check: (posts) => posts.filter((p) => p.scheduled_for).length >= 5 },
    ],
  },
  7: {
    title: "Level 7 — Kampania 🚀",
    subtitle: "Czas na coś większego. Pierwsza kampania marki.",
    reward: "Pierwsza kampania gotowa. Jesteś DiGin Legend 🌻",
    encouragement: "Twoja marka urosła. Czas zbudować ogród.",
    challenges: [
      { id: "c_posts20",  label: "Osiągnij 20 postów w bibliotece",  hint: "Budujesz prawdziwe archiwum treści",       action: "generator", check: (posts) => posts.length >= 20 },
      { id: "c_sched10",  label: "Zaplanuj 10 postów w kalendarzu",  hint: "Dwa tygodnie zaplanowanego contentu 🔥",   action: "calendar",  check: (posts) => posts.filter((p) => p.scheduled_for).length >= 10 },
      { id: "c_media5",   label: "Dodaj zdjęcia do 5 postów",        hint: "Wizualny content = wyższy zasięg",         action: "generator", check: (posts) => posts.filter((p) => !!p.media_url).length >= 5 },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeCurrentLevel(posts: GeneratedPost[], profile: BrandProfile | null, ui: Set<string>): number {
  for (let lvl = 0; lvl <= 7; lvl++) {
    const data = LEVEL_DATA[lvl];
    if (!data || data.challenges.length === 0) continue;
    if (!data.challenges.every((c) => c.check(posts, profile, ui))) return lvl;
  }
  return 7;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Dzień dobry";
  if (h < 17) return "Cześć";
  return "Dobry wieczór";
}

function getStreakState(): { drops: number; resting: boolean } {
  try {
    const raw = localStorage.getItem("digin_streak");
    if (!raw) return { drops: 0, resting: false };
    const { dates } = JSON.parse(raw) as { dates: string[] };
    const lastDate = dates[dates.length - 1];
    const daysSinceLast = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 999;
    const thisWeek = dates.filter((d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000) < 7).length;
    return { drops: Math.min(thisWeek, 7), resting: daysSinceLast > 2 };
  } catch { return { drops: 0, resting: false }; }
}

function markActivityToday() {
  try {
    const raw = localStorage.getItem("digin_streak");
    const today = new Date().toDateString();
    const { dates = [] } = raw ? JSON.parse(raw) : { dates: [] };
    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem("digin_streak", JSON.stringify({ dates: dates.slice(-30) }));
    }
  } catch {}
}

// ─── Brand Lab helpers ────────────────────────────────────────────────────────

const MODE_CONFIG = {
  shadow: {
    label: "Shadow Mode",
    emoji: "🔮",
    headline: "Twoja marka jest silna",
    desc: "AI dopasowuje się do Twojego stylu i subtelnie go wzmacnia.",
    bgClass: "bg-emerald-50 border-emerald-200",
    badgeClass: "bg-emerald-500 text-white",
  },
  upgrade: {
    label: "Upgrade Mode",
    emoji: "🚀",
    headline: "Zauważyliśmy potencjał",
    desc: "Pomożemy Ci wzmocnić i uporządkować komunikację — krok po kroku.",
    bgClass: "bg-amber-50 border-amber-200",
    badgeClass: "bg-amber-500 text-white",
  },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold text-slate-900">{score}</p>
        <p className="text-[10px] text-slate-400 leading-none">/ 100</p>
      </div>
    </div>
  );
}

// ─── Challenge Alert ──────────────────────────────────────────────────────────

function ChallengeAlert({ posts, profile, currentLevel, ui, onNavigate }: {
  posts: GeneratedPost[];
  profile: BrandProfile | null;
  currentLevel: number;
  ui: Set<string>;
  onNavigate: (v: ViewType) => void;
}) {
  const data = LEVEL_DATA[currentLevel];
  const { drops, resting } = getStreakState();
  if (!data) return null;

  if (currentLevel === 7 && data.challenges.every((c) => c.check(posts, profile, ui))) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🌻</span>
          <div>
            <p className="text-base font-bold text-amber-800">Ogród marki — Maksymalny poziom!</p>
            <p className="text-sm text-amber-600">Jesteś DiGin Legend. Twoja marka w pełnym rozkwicie. 🏆</p>
          </div>
        </div>
      </div>
    );
  }

  const results = data.challenges.map((c) => ({ ...c, done: c.check(posts, profile, ui) }));
  const doneCount = results.filter((r) => r.done).length;
  const progressPct = Math.round((doneCount / results.length) * 100);
  const emoji = GROWTH_LEVELS[currentLevel]?.emoji ?? "🌱";

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{emoji}</span>
            <p className="text-sm font-bold text-emerald-900">{data.title}</p>
          </div>
          <p className="text-xs text-emerald-600 leading-snug pl-7">{data.subtitle}</p>
        </div>
        <span className="text-xs font-bold text-white bg-emerald-500 rounded-full px-2.5 py-1 shrink-0 ml-2">{doneCount}/{results.length}</span>
      </div>

      {resting && (
        <div className="mt-3 mb-1 rounded-xl bg-emerald-100/60 px-3 py-2 text-xs text-emerald-700 font-medium">
          🌿 Twoja marka chwilę odpoczywa. Wróć z jednym małym krokiem.
        </div>
      )}

      <div className="mt-3 mb-4 h-2 w-full rounded-full bg-emerald-100">
        <div className="h-2 rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="space-y-2">
        {results.map((c) => (
          <div key={c.id}
            onClick={() => { if (!c.done && c.action) onNavigate(c.action); }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${c.done ? "bg-white/50 cursor-default" : "bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-sm cursor-pointer active:scale-[0.99]"}`}>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.done ? "bg-emerald-500 text-white" : "border-2 border-emerald-200"}`}>
              {c.done ? "✓" : ""}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${c.done ? "line-through text-slate-400" : "text-slate-800"}`}>{c.label}</p>
              {!c.done && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.hint}</p>}
            </div>
            {!c.done && <span className="text-slate-300 shrink-0">›</span>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-emerald-600 font-medium italic">{data.encouragement}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < drops ? "opacity-100" : "opacity-20"}`}>💧</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [view, setView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [generatedPost, setGeneratedPost] = useState("");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [savingToCalendar, setSavingToCalendar] = useState(false);

  const [generateError, setGenerateError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [generatorForm, setGeneratorForm] = useState<GeneratorForm>({ platform: "Instagram", type: "Sales post", topic: "" });
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [tone, setTone] = useState("default");
  const [length, setLength] = useState("medium");
  const [scheduledDate, setScheduledDate] = useState(() => toDateTimeLocalString(new Date()));

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [engagementPost, setEngagementPost] = useState("");
  const [engagementContext, setEngagementContext] = useState("");
  const [engagementComments, setEngagementComments] = useState<string[]>([]);
  const [loadingEngagement, setLoadingEngagement] = useState(false);
  const [engagementError, setEngagementError] = useState("");

  // Brand Lab state
  const [analyzePosts, setAnalyzePosts] = useState("");
  const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [rewriteInput, setRewriteInput] = useState("");
  const [rewriteVariants, setRewriteVariants] = useState<RewriteVariant[]>([]);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [rewriteError, setRewriteError] = useState("");
  const [rewriteMeta, setRewriteMeta] = useState<{ mode: string; userStylePct: number; improvePct: number } | null>(null);
  const [copiedRewriteIdx, setCopiedRewriteIdx] = useState<number | null>(null);

  const [uiCompletions, setUiCompletions] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("digin_ui_completions");
      if (stored) setUiCompletions(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  function markUiComplete(key: string) {
    setUiCompletions((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      try { localStorage.setItem("digin_ui_completions", JSON.stringify([...next])); } catch {}
      markActivityToday();
      return next;
    });
  }

  useEffect(() => {
    markUiComplete("platform_chosen");
  }, [generatorForm.platform]);

  useEffect(() => {
    if (generatorForm.type === "Educational") markUiComplete("educational_generated");
    if (generatorForm.type === "Sales post") markUiComplete("sales_generated");
    if (generatorForm.type === "Storytelling") markUiComplete("storytelling_generated");
  }, [generatorForm.type]);

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  async function loadProfile() {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/profile", { method: "GET", cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return;
      const json = await res.json();
      if (!res.ok) return;
      if (!json.data) { window.location.href = "/onboarding"; return; }
      setBrandProfile(json.data);
    } catch {} finally { setLoadingProfile(false); }
  }

  async function loadPosts() {
    try {
      setLoadingPosts(true);
      setPostsError("");
      const res = await fetch("/api/posts", { method: "GET", cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) { setPostsError("Błąd endpointu."); return; }
      const json = await res.json();
      if (!res.ok) { setPostsError(json.error || "Błąd ładowania."); return; }
      setPosts(json.data || []);
    } catch { setPostsError("Błąd połączenia."); } finally { setLoadingPosts(false); }
  }

  useEffect(() => { loadProfile(); loadPosts(); }, []);

  const handleGenerate = async () => {
    try {
      setLoadingGenerate(true);
      setGenerateError("");
      setGeneratedPost("");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...generatorForm, includeHashtags, tone, length }),
      });
      const json = await res.json();
      if (!res.ok) { setGenerateError(json.error || "Błąd generowania."); return; }
      if (json.output) {
        setGeneratedPost(json.output);
        markActivityToday();
        try {
          const count = parseInt(localStorage.getItem("digin_gen_count") || "0") + 1;
          localStorage.setItem("digin_gen_count", String(count));
          if (count >= 3) markUiComplete("three_variants");
        } catch {}
      }
    } catch { setGenerateError("Błąd połączenia."); } finally { setLoadingGenerate(false); }
  };

  const handleSaveToCalendar = async () => {
    try {
      if (!generatedPost.trim()) { setGenerateError("Najpierw wygeneruj post."); return; }
      setSavingToCalendar(true);
      setGenerateError("");
      setSaveMessage("");
      let finalMediaUrl = mediaUrl.startsWith("http") ? mediaUrl : "";
      if (mediaFile && !finalMediaUrl) {
        setUploadingMedia(true);
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const fileName = `${Date.now()}-${mediaFile.name}`;
        const { data, error } = await supabase.storage.from("post-media").upload(fileName, mediaFile);
        if (!error && data) {
          const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(data.path);
          finalMediaUrl = urlData.publicUrl;
          setMediaUrl(finalMediaUrl);
        }
        setUploadingMedia(false);
      }
      const scheduledForISO = new Date(scheduledDate).toISOString();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: generatedPost, scheduled_for: scheduledForISO, media_url: finalMediaUrl || null }),
      });
      const json = await res.json();
      if (!res.ok) { setGenerateError(json.error || "Błąd zapisu."); return; }
      await loadPosts();
      const savedDate = new Date(scheduledForISO);
      setSelectedDate(savedDate);
      setCurrentMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
      setSaveMessage("Post zapisany do kalendarza ✅");
      markActivityToday();
      handleNavigate("calendar");
    } catch { setGenerateError("Błąd połączenia."); } finally { setSavingToCalendar(false); }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Skopiowano ✅");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch { setCopyMessage("Błąd kopiowania."); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/posts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) await loadPosts();
    } catch {}
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
      if (!res.ok) { setEngagementError(json.error || "Błąd."); return; }
      setEngagementComments(json.comments || []);
      markUiComplete("engagement_used");
      markUiComplete("engagement_ideas");
      markActivityToday();
    } catch { setEngagementError("Błąd połączenia."); } finally { setLoadingEngagement(false); }
  };

  const handleAnalyzeDNA = async () => {
    const postList = analyzePosts.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 20);
    if (postList.length < 2) { setAnalyzeError("Wklej przynajmniej 2 posty oddzielone pustą linią."); return; }
    try {
      setLoadingAnalyze(true);
      setAnalyzeError("");
      setBrandDNA(null);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: postList }),
      });
      const json = await res.json();
      if (!res.ok) { setAnalyzeError(json.error || "Błąd analizy."); return; }
      setBrandDNA(json.brandDNA);
      markUiComplete("dna_analyzed");
      markActivityToday();
    } catch { setAnalyzeError("Błąd połączenia."); } finally { setLoadingAnalyze(false); }
  };

  const handleRewrite = async () => {
    if (!rewriteInput.trim()) { setRewriteError("Wklej post do przepisania."); return; }
    try {
      setLoadingRewrite(true);
      setRewriteError("");
      setRewriteVariants([]);
      setRewriteMeta(null);
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rewriteInput, brandDNA, postCount: posts.length }),
      });
      const json = await res.json();
      if (!res.ok) { setRewriteError(json.error || "Błąd."); return; }
      setRewriteVariants(json.variants || []);
      setRewriteMeta({ mode: json.mode, userStylePct: json.userStylePct, improvePct: json.improvePct });
      markUiComplete("rewrite_used");
      markActivityToday();
    } catch { setRewriteError("Błąd połączenia."); } finally { setLoadingRewrite(false); }
  };

  const handleNavigate = (v: ViewType) => {
    setView(v);
    setSidebarOpen(false);
    if (v === "drafts") markUiComplete("drafts_reviewed");
  };

  const stats = useMemo(() => ({ total: posts.length, scheduled: posts.filter((p) => p.scheduled_for).length }), [posts]);
  const recentPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const postsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return posts.filter((p) => p.scheduled_for && isSameDay(new Date(p.scheduled_for), selectedDate));
  }, [posts, selectedDate]);

  const monthLabel = currentMonth.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  const currentLevel = useMemo(() => computeCurrentLevel(posts, brandProfile, uiCompletions), [posts, brandProfile, uiCompletions]);
  const growthLevelData = GROWTH_LEVELS[currentLevel] ?? GROWTH_LEVELS[7];
  const greeting = getGreeting();
  const userName = brandProfile?.company || "tam";

  const NAV_ITEMS = [
    { id: "dashboard" as ViewType, label: "Home",      icon: "🏠" },
    { id: "generator" as ViewType, label: "Generator", icon: "✨" },
    { id: "calendar"  as ViewType, label: "Kalendarz", icon: "📅" },
    { id: "engagement"as ViewType, label: "Engagement",icon: "💬" },
    { id: "drafts"    as ViewType, label: "Drafty",    icon: "📝" },
    { id: "brandlab"  as ViewType, label: "Brand Lab", icon: "🧬" },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white text-lg font-bold shadow-sm">D</div>
        <div><h1 className="text-lg font-bold tracking-tight text-slate-900">DiGin</h1><p className="text-xs text-slate-400">AI Marketing Assistant</p></div>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => handleNavigate(item.id)}
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${view === item.id ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
            <span className="text-base">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {item.id === "brandlab" && !uiCompletions.has("dna_analyzed") && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-amber-400" />
            )}
          </button>
        ))}
      </nav>
      <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Twój progres</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{growthLevelData.emoji}</span>
          <div><p className="text-sm font-semibold text-slate-800">{growthLevelData.name}</p><p className="text-xs text-emerald-600">Level {currentLevel}</p></div>
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-snug">{growthLevelData.description}</p>
      </div>
      <button onClick={handleSignOut} className="mt-4 w-full flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
        <span>👋</span> Wyloguj się
      </button>
    </>
  );

  const BottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {[
          { id: "dashboard"  as ViewType, label: "Home",     icon: "🏠" },
          { id: "calendar"   as ViewType, label: "Kalendarz",icon: "📅" },
          { id: "drafts"     as ViewType, label: "Drafty",   icon: "📝" },
          { id: "brandlab"   as ViewType, label: "Lab",      icon: "🧬" },
        ].map((item) => (
          <button key={item.id} onClick={() => handleNavigate(item.id)} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <span className="text-2xl">{item.icon}</span>
            <span className={`text-xs font-medium ${view === item.id ? "text-emerald-600" : "text-slate-400"}`}>{item.label}</span>
          </button>
        ))}
        <button onClick={() => handleNavigate("generator")} className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg -mt-4">
          <span className="text-xl">+</span>
        </button>
      </div>
    </nav>
  );

  const analyzePostList = analyzePosts.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 20);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">

      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">✕</button>
          <img src={lightboxUrl} alt="full" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-[260px] flex-col border-r border-slate-100 bg-white px-5 py-6"><SidebarContent /></aside>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-10 w-[260px] bg-white px-5 py-6 overflow-y-auto">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 text-xl">✕</button>
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div className="p-4 lg:p-8 space-y-5 max-w-2xl mx-auto lg:max-w-none">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{greeting}, {userName}! {growthLevelData.emoji}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Nie musisz robić wszystkiego dziś.</p>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">☰</button>
              </div>

              {!loadingPosts && !loadingProfile && (
                <ChallengeAlert posts={posts} profile={brandProfile} currentLevel={currentLevel} ui={uiCompletions} onNavigate={handleNavigate} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleNavigate("generator")} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition">✨ Generuj post</button>
                <button onClick={() => handleNavigate("brandlab")} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">🧬 Brand Lab</button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Twoja marka rośnie</p>
                  <span className="text-2xl">{growthLevelData.emoji}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{growthLevelData.name} <span className="text-sm font-normal text-slate-400">— Level {currentLevel}</span></p>
                <p className="text-sm text-slate-500 mt-0.5 mb-4">{growthLevelData.description}</p>
                <div className="flex items-center gap-6">
                  <div className="text-center"><p className="text-xl font-bold text-slate-900">{stats.total}</p><p className="text-xs text-slate-500">Posty</p></div>
                  <div className="h-8 w-px bg-slate-100" />
                  <div className="text-center"><p className="text-xl font-bold text-slate-900">{stats.scheduled}</p><p className="text-xs text-slate-500">Zaplanowane</p></div>
                  <div className="h-8 w-px bg-slate-100" />
                  <div className="text-center"><p className="text-xl font-bold text-emerald-600">Lv.{currentLevel}</p><p className="text-xs text-slate-500">Poziom</p></div>
                  {brandDNA && (
                    <>
                      <div className="h-8 w-px bg-slate-100" />
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: brandDNA.score >= 70 ? "#10b981" : brandDNA.score >= 50 ? "#f59e0b" : "#ef4444" }}>{brandDNA.score}</p>
                        <p className="text-xs text-slate-500">Brand Score</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ostatnie drafty</p>
                  <button onClick={() => handleNavigate("drafts")} className="text-xs text-emerald-600 font-medium">Zobacz wszystkie →</button>
                </div>
                {loadingPosts && <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-400">Ładowanie...</div>}
                {!loadingPosts && recentPosts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                    <p className="text-2xl mb-2">🌱</p>
                    <p className="text-sm text-slate-400">Brak draftów. Wygeneruj pierwszy post!</p>
                    <button onClick={() => handleNavigate("generator")} className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">Generuj teraz</button>
                  </div>
                )}
                <div className="space-y-2">
                  {recentPosts.map((post) => (
                    <button key={post.id} onClick={() => handleNavigate("drafts")} className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left hover:border-emerald-200 hover:shadow-sm transition">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden">
                        {post.media_url ? <img src={post.media_url} alt="media" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-emerald-600">{(post.content.replace(/[^a-zA-Z]/g, "").charAt(0) || "D").toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{post.content.split("\n")[0] || "Draft"}</p>
                        <p className="mt-0.5 text-xs text-emerald-600 font-medium">{post.scheduled_for ? `📅 ${formatDate(post.scheduled_for)}` : "Draft"}</p>
                      </div>
                      <span className="text-slate-300">›</span>
                    </button>
                  ))}
                </div>
              </div>

              {brandProfile && (
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profil marki</p>
                    <Link href="/edit-brand" className="text-xs text-emerald-600 font-medium">Edytuj →</Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brandProfile.company && <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{brandProfile.company}</span>}
                    {brandProfile.industry && <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs text-slate-600">{brandProfile.industry}</span>}
                    {brandProfile.tone && <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs text-slate-600">{brandProfile.tone}</span>}
                  </div>
                </div>
              )}
              {!brandProfile && !loadingProfile && (
                <Link href="/edit-brand" className="flex items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition">
                  <span className="text-2xl">🧠</span>
                  <div><p className="text-sm font-semibold text-emerald-800">Uzupełnij profil marki</p><p className="text-xs text-emerald-600">Pomoże AI lepiej tworzyć treści dla Ciebie</p></div>
                  <span className="ml-auto text-emerald-500">›</span>
                </Link>
              )}
            </div>
          )}

          {/* ── GENERATOR ── */}
          {view === "generator" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400 hover:text-slate-600">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">Generator treści AI</h2><p className="text-sm text-slate-500">Posty skrojone pod Twoją markę</p></div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ustawienia</p>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Platforma</label>
                    <select value={generatorForm.platform} onChange={(e) => setGeneratorForm((p) => ({ ...p, platform: e.target.value as GeneratorForm["platform"] }))} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option>Instagram</option><option>Facebook</option><option>LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Typ posta</label>
                    <select value={generatorForm.type} onChange={(e) => setGeneratorForm((p) => ({ ...p, type: e.target.value as GeneratorForm["type"] }))} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option>Sales post</option><option>Educational</option><option>Storytelling</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Temat</label>
                    <input value={generatorForm.topic} onChange={(e) => setGeneratorForm((p) => ({ ...p, topic: e.target.value }))} placeholder="np. wiosenna oferta, nowy produkt, efekt klienta" className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Ton</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option value="default">Domyślny (głos marki)</option>
                      <option value="bold">Odważny i pewny</option>
                      <option value="casual">Casual i przyjazny</option>
                      <option value="funny">Zabawny i lekki</option>
                      <option value="formal">Formalny i profesjonalny</option>
                      <option value="inspiring">Inspirujący i motywujący</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Długość</label>
                    <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition">
                      <option value="short">Krótki (1–3 linijki)</option>
                      <option value="medium">Średni (4–6 linijek)</option>
                      <option value="long">Długi (7–10 linijek)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <input type="checkbox" id="hashtags" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                    <label htmlFor="hashtags" className="text-sm font-medium text-slate-700 cursor-pointer">Dodaj hashtagi</label>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Data i godzina publikacji</label>
                    <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition" />
                  </div>
                  <button onClick={handleGenerate} disabled={loadingGenerate} className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loadingGenerate ? "Generowanie..." : "✨ Generuj treść"}
                  </button>
                  {generateError && <p className="text-sm text-red-500">{generateError}</p>}
                  {copyMessage && <p className="text-sm text-emerald-600">{copyMessage}</p>}
                  {saveMessage && <p className="text-sm text-emerald-600">{saveMessage}</p>}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Wynik</p><h3 className="text-lg font-bold text-slate-900">Wygenerowany post</h3></div>
                    {generatedPost && <button onClick={() => setGeneratedPost("")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">Wyczyść</button>}
                  </div>
                  {!generatedPost && !loadingGenerate && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      <span className="text-4xl mb-3">✨</span>
                      <p className="text-sm text-slate-400">Kliknij Generuj, żeby zobaczyć swój post.</p>
                    </div>
                  )}
                  {loadingGenerate && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center">
                      <span className="text-4xl mb-3 animate-bounce">🌱</span>
                      <p className="text-sm text-emerald-600 font-medium">Tworzę treść dla Twojej marki...</p>
                    </div>
                  )}
                  {generatedPost && !loadingGenerate && (
                    <>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Podgląd</p>
                        <textarea value={generatedPost} onChange={(e) => setGeneratedPost(e.target.value)} className="w-full resize-none rounded-xl bg-transparent text-sm leading-7 text-slate-800 outline-none min-h-[120px]" rows={6} />
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-3 mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Termin publikacji</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">{scheduledDate ? formatDateTime(scheduledDate) : "Brak daty"}</p>
                      </div>
                      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-600 mb-2">📎 Dodaj zdjęcie (opcjonalnie)</p>
                        <a href={generatorForm.platform === "Instagram" ? "https://www.canva.com/create/instagram-posts/" : generatorForm.platform === "Facebook" ? "https://www.canva.com/create/facebook-posts/" : "https://www.canva.com/create/linkedin-banners/"}
                          target="_blank" rel="noopener noreferrer"
                          className="mb-3 flex items-center justify-center gap-2 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition">
                          🎨 Zaprojektuj w Canva, potem wgraj poniżej
                        </a>
                        {mediaUrl && <img src={mediaUrl} alt="preview" className="w-full rounded-lg mb-2 max-h-40 object-cover cursor-pointer" onClick={() => setLightboxUrl(mediaUrl)} />}
                        <input type="file" accept="image/*,video/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setMediaFile(file); const r = new FileReader(); r.onload = (ev) => setMediaUrl(ev.target?.result as string); r.readAsDataURL(file); }
                        }} className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-700" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleCopy(generatedPost)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Kopiuj</button>
                        <button onClick={handleGenerate} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Wygeneruj ponownie</button>
                        <button onClick={handleSaveToCalendar} disabled={savingToCalendar || uploadingMedia} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                          {savingToCalendar || uploadingMedia ? "Zapisuję..." : "Zapisz do kalendarza"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {view === "calendar" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">Kalendarz treści</h2><p className="text-sm text-slate-500">Planuj i harmonogramuj posty</p></div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 capitalize">{monthLabel}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">‹</button>
                      <button onClick={() => setCurrentMonth(new Date())} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Dziś</button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">›</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {["P","W","Ś","C","P","S","N"].map((d,i) => <div key={i} className="py-2 text-center text-xs font-semibold text-slate-400">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isToday = day ? isSameDay(day, new Date()) : false;
                      const isSelected = day && selectedDate ? isSameDay(day, selectedDate) : false;
                      const hasPost = !!day && posts.some((p) => p.scheduled_for && isSameDay(new Date(p.scheduled_for), day));
                      return (
                        <button key={index} onClick={() => { if (!day) return; setSelectedDate(day); setScheduledDate(toDateTimeLocalString(day)); }} disabled={!day}
                          className={`relative min-h-[48px] rounded-xl p-1.5 text-left transition ${!day ? "cursor-default" : isSelected ? "bg-emerald-500 text-white shadow-sm" : isToday ? "bg-emerald-50 border border-emerald-200" : "border border-transparent hover:border-slate-200 hover:bg-slate-50"}`}>
                          {day && <>
                            <span className={`text-xs font-medium ${isSelected ? "text-white" : isToday ? "text-emerald-700" : "text-slate-700"}`}>{day.getDate()}</span>
                            {hasPost && <div className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />}
                          </>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Wybrany dzień</p>
                  <h3 className="font-bold text-slate-900 mb-4">{selectedDate ? selectedDate.toLocaleDateString("pl-PL", { weekday: "long", month: "long", day: "numeric" }) : "Wybierz datę"}</h3>
                  {postsForSelectedDate.length > 0 ? (
                    <div className="space-y-3">
                      {postsForSelectedDate.map((post) => (
                        <div key={post.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          {post.media_url && <img src={post.media_url} alt="media" className="w-full rounded-lg mb-2 max-h-32 object-cover cursor-pointer" onClick={() => setLightboxUrl(post.media_url ?? null)} />}
                          <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => handleCopy(post.content)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-white">Kopiuj</button>
                            <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50">Usuń</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center"><p className="text-sm text-slate-400">Brak postów na ten dzień</p></div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { if (selectedDate) setScheduledDate(toDateTimeLocalString(selectedDate)); handleNavigate("generator"); }} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">+ Utwórz post</button>
                    <button onClick={() => handleNavigate("drafts")} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Drafty</button>
                  </div>
                  {saveMessage && <p className="mt-3 text-sm text-emerald-600">{saveMessage}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── ENGAGEMENT ── */}
          {view === "engagement" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div><h2 className="text-xl font-bold text-slate-900">AI Engagement</h2><p className="text-sm text-slate-500">Komentarze, które brzmią po ludzku</p></div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Treść posta (opcjonalnie)</label>
                    <textarea value={engagementPost} onChange={(e) => setEngagementPost(e.target.value)} placeholder="Wklej post, do którego chcesz napisać komentarz..." rows={5} className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kontekst / kąt komentarza</label>
                    <input value={engagementContext} onChange={(e) => setEngagementContext(e.target.value)} placeholder="np. podziękowanie, pytanie, komplement..." className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-400 transition" />
                  </div>
                  <button onClick={handleGenerateEngagement} disabled={loadingEngagement} className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                    {loadingEngagement ? "Generowanie..." : "💬 Generuj komentarze"}
                  </button>
                  {engagementError && <p className="text-sm text-red-500">{engagementError}</p>}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Wynik</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Propozycje komentarzy</h3>
                  {engagementComments.length === 0 && !loadingEngagement && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      <span className="text-4xl mb-3">💬</span>
                      <p className="text-sm text-slate-400">Wypełnij formularz i kliknij Generuj.</p>
                    </div>
                  )}
                  {loadingEngagement && (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center">
                      <span className="text-4xl mb-3 animate-bounce">💭</span>
                      <p className="text-sm text-emerald-600">Tworzę komentarze...</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {engagementComments.map((comment, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-700 leading-6">{comment}</p>
                        <div className="mt-2 flex justify-end">
                          <button onClick={() => handleCopy(comment)} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Kopiuj</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {copyMessage && <p className="mt-3 text-sm text-emerald-600">{copyMessage}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── DRAFTS ── */}
          {view === "drafts" && (
            <div className="p-4 lg:p-8 max-w-2xl mx-auto lg:max-w-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                  <div><h2 className="text-xl font-bold text-slate-900">Zapisane drafty</h2><p className="text-sm text-slate-500">Twoja biblioteka treści</p></div>
                </div>
                <button onClick={() => handleNavigate("generator")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">+ Nowy draft</button>
              </div>
              {loadingPosts && <div className="rounded-2xl bg-white border border-slate-100 p-4 text-sm text-slate-400">Ładowanie...</div>}
              {postsError && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-500">{postsError}</div>}
              {!loadingPosts && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                  <span className="text-5xl mb-4">📝</span>
                  <p className="text-slate-500 mb-4">Brak draftów. Utwórz pierwszy post!</p>
                  <button onClick={() => handleNavigate("generator")} className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white">Generuj teraz</button>
                </div>
              )}
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                    {post.media_url && <img src={post.media_url} alt="media" className="w-full rounded-xl mb-3 max-h-48 object-cover cursor-pointer hover:opacity-90 transition" onClick={() => setLightboxUrl(post.media_url ?? null)} />}
                    <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-xs text-slate-400">Utworzono: {formatDateTime(post.created_at)}</span>
                        {post.scheduled_for && <span className="ml-3 text-xs text-emerald-600">📅 {formatDateTime(post.scheduled_for)}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(post.content)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Kopiuj</button>
                        <button onClick={() => { setGeneratedPost(post.content); setScheduledDate(post.scheduled_for ? toDateTimeLocalString(new Date(post.scheduled_for)) : toDateTimeLocalString(new Date())); handleNavigate("generator"); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edytuj</button>
                        <button onClick={() => handleDelete(post.id)} className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">Usuń</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {copyMessage && <p className="mt-4 text-sm text-emerald-600">{copyMessage}</p>}
            </div>
          )}

          {/* ── BRAND LAB ── */}
          {view === "brandlab" && (
            <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => handleNavigate("dashboard")} className="lg:hidden text-slate-400">‹</button>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Brand Lab 🧬</h2>
                  <p className="text-sm text-slate-500">AI analizuje Twoją markę i uczy się jak ją wzmocnić.</p>
                </div>
              </div>

              {/* Step 1: Analyzer */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">1</span>
                  <h3 className="font-bold text-slate-900">Analiza DNA marki</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 pl-8">Wklej 3–10 swoich ostatnich postów (każdy oddziel pustą linią). AI przeanalizuje Twój styl.</p>
                <textarea
                  value={analyzePosts}
                  onChange={(e) => setAnalyzePosts(e.target.value)}
                  placeholder={"Wklej tutaj swoje posty...\n\n(Każdy post oddziel pustą linią)\n\nPost 1...\n\nPost 2..."}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition font-mono"
                />
                <div className="flex items-center justify-between mt-2 mb-4">
                  <p className="text-xs text-slate-400">{analyzePostList.length} post{analyzePostList.length !== 1 ? "ów" : ""} wykrytych</p>
                  {analyzeError && <p className="text-xs text-red-500">{analyzeError}</p>}
                </div>
                <button onClick={handleAnalyzeDNA} disabled={loadingAnalyze || analyzePostList.length < 2} className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loadingAnalyze ? "Analizuję markę..." : "🧬 Analizuj DNA marki"}
                </button>
              </div>

              {/* Loading */}
              {loadingAnalyze && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center">
                  <span className="text-4xl animate-pulse">🧬</span>
                  <p className="mt-3 text-sm text-emerald-700 font-medium">Buduję profil DNA Twojej marki...</p>
                </div>
              )}

              {/* DNA Result */}
              {brandDNA && !loadingAnalyze && (() => {
                const modeKey = brandDNA.mode ?? "upgrade";
                const modeCfg = MODE_CONFIG[modeKey];
                return (
                  <div className={`rounded-2xl border p-5 ${modeCfg.bgClass}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${modeCfg.badgeClass}`}>
                          {modeCfg.emoji} {modeCfg.label}
                        </span>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{modeCfg.headline}</h3>
                        <p className="text-sm text-slate-600 mt-0.5">{modeCfg.desc}</p>
                        <p className="mt-2 text-sm italic text-slate-500">„{brandDNA.recommendation}"</p>
                      </div>
                      <div className="ml-4 shrink-0 text-center">
                        <ScoreRing score={brandDNA.score} />
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Brand Score</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {[
                        { label: "Ton", value: brandDNA.tone },
                        { label: "Energia", value: brandDNA.energy },
                        { label: "Struktura", value: brandDNA.structure },
                        { label: "CTA", value: brandDNA.cta },
                        { label: "Spójność", value: brandDNA.consistency },
                        { label: "Język", value: brandDNA.language },
                        { label: "Długość", value: brandDNA.avgLength },
                        { label: "Emoji", value: brandDNA.usesEmoji ? "Tak" : "Nie" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{item.label}</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {brandDNA.strengths?.length > 0 && (
                        <div className="rounded-xl bg-white/70 p-3">
                          <p className="text-xs font-semibold text-emerald-700 mb-2">✅ Mocne strony</p>
                          {brandDNA.strengths.map((s, i) => <p key={i} className="text-xs text-slate-700">• {s}</p>)}
                        </div>
                      )}
                      {brandDNA.weaknesses?.length > 0 && (
                        <div className="rounded-xl bg-white/70 p-3">
                          <p className="text-xs font-semibold text-amber-700 mb-2">🔧 Do wzmocnienia</p>
                          {brandDNA.weaknesses.map((w, i) => <p key={i} className="text-xs text-slate-700">• {w}</p>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Step 2: Rewrite me better */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white text-xs font-bold">2</span>
                  <h3 className="font-bold text-slate-900">Rewrite me better 🔥</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 pl-8">
                  Wklej swój post — AI przepisze go w 3 wersjach.
                  {brandDNA ? <span className="text-emerald-600 font-medium"> Używam Twojego Brand DNA.</span> : <span> (Zrób analizę DNA wyżej dla lepszych wyników.)</span>}
                </p>
                {rewriteMeta && (
                  <div className="mb-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center gap-2">
                    <span className="text-sm">{rewriteMeta.mode === "shadow" ? "🔮" : "🚀"}</span>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">{rewriteMeta.mode === "shadow" ? "Shadow Mode" : "Upgrade Mode"}</span>
                      {" "}— {rewriteMeta.userStylePct}% Twój styl, {rewriteMeta.improvePct}% poprawa
                    </p>
                  </div>
                )}
                <textarea value={rewriteInput} onChange={(e) => setRewriteInput(e.target.value)} placeholder="Wklej tutaj post, który chcesz przepisać..." rows={5} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition mb-3" />
                {rewriteError && <p className="text-sm text-red-500 mb-3">{rewriteError}</p>}
                <button onClick={handleRewrite} disabled={loadingRewrite || !rewriteInput.trim()} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loadingRewrite ? "Przepisuję..." : "🔥 Rewrite me better"}
                </button>
              </div>

              {loadingRewrite && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                  <span className="text-4xl animate-bounce">✍️</span>
                  <p className="mt-3 text-sm text-slate-600 font-medium">Tworzę 3 wersje Twojego posta...</p>
                </div>
              )}

              {rewriteVariants.length > 0 && !loadingRewrite && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">3 wersje Twojego posta</p>
                  {rewriteVariants.map((v, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white text-[10px] font-bold">{i + 1}</span>
                            <p className="text-sm font-bold text-slate-900">{v.label}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 pl-7">{v.description}</p>
                        </div>
                        <button onClick={async () => { await navigator.clipboard.writeText(v.content); setCopiedRewriteIdx(i); setTimeout(() => setCopiedRewriteIdx(null), 2000); }}
                          className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
                          {copiedRewriteIdx === i ? "Skopiowano ✅" : "Kopiuj"}
                        </button>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-sm text-slate-800 leading-7 whitespace-pre-wrap">{v.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
      <BottomNav />
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Błędna data";
  return date.toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pl-PL", { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function buildCalendarDays(currentMonth: Date): Array<Date | null> {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const mondayBasedStart = (firstDay.getDay() + 6) % 7;
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
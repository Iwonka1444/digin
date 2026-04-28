"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BrandProfile = {
  company: string;
  industry: string;
  tone: string;
  offer: string;
  audience: string;
  brand_colors?: string;
  brand_style?: string;
};

const TONE_OPTIONS = [
  { value: "professional", label: "Professional & trustworthy" },
  { value: "casual", label: "Casual & friendly" },
  { value: "bold", label: "Bold & confident" },
  { value: "funny", label: "Funny & playful" },
  { value: "inspiring", label: "Inspiring & motivational" },
  { value: "luxury", label: "Luxury & premium" },
];

const INDUSTRY_OPTIONS = [
  "Marketing & Advertising",
  "E-commerce & Retail",
  "Beauty & Wellness",
  "Food & Beverage",
  "Technology & Software",
  "Health & Fitness",
  "Real Estate",
  "Education & Coaching",
  "Finance & Accounting",
  "Fashion & Lifestyle",
  "Travel & Hospitality",
  "Construction & Interior",
  "Legal & Consulting",
  "Other",
];

const STYLE_OPTIONS = [
  { value: "minimalist", label: "✦ Minimalistyczny" },
  { value: "bold", label: "⚡ Odważny / Bold" },
  { value: "elegant", label: "✨ Elegancki" },
  { value: "playful", label: "🎨 Zabawny / Playful" },
  { value: "corporate", label: "💼 Korporacyjny" },
  { value: "natural", label: "🌿 Naturalny / Organic" },
  { value: "modern", label: "◈ Nowoczesny" },
  { value: "vintage", label: "◎ Vintage / Retro" },
];

const PALETTE_COLORS = [
  // Reds & Pinks
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#eab308", name: "Yellow" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#a855f7", name: "Purple" },
  // Greens
  { hex: "#10b981", name: "Emerald" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#84cc16", name: "Lime" },
  { hex: "#14b8a6", name: "Teal" },
  // Blues
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#0ea5e9", name: "Sky" },
  // Neutrals
  { hex: "#1e293b", name: "Dark" },
  { hex: "#64748b", name: "Gray" },
  { hex: "#f1f5f9", name: "Light" },
  { hex: "#ffffff", name: "White" },
  { hex: "#fef3c7", name: "Cream" },
  { hex: "#d4af37", name: "Gold" },
];

function ColorPicker({
  selectedColors,
  onChange,
}: {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}) {
  const [customHex, setCustomHex] = useState("");
  const [customError, setCustomError] = useState("");

  const toggleColor = (hex: string) => {
    if (selectedColors.includes(hex)) {
      onChange(selectedColors.filter((c) => c !== hex));
    } else if (selectedColors.length < 5) {
      onChange([...selectedColors, hex]);
    }
  };

  const addCustom = () => {
    const val = customHex.trim();
    const hex = val.startsWith("#") ? val : `#${val}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setCustomError("Wpisz poprawny kolor np. #FF5733");
      return;
    }
    if (selectedColors.includes(hex)) {
      setCustomError("Ten kolor już jest dodany");
      return;
    }
    if (selectedColors.length >= 5) {
      setCustomError("Maksymalnie 5 kolorów");
      return;
    }
    onChange([...selectedColors, hex]);
    setCustomHex("");
    setCustomError("");
  };

  return (
    <div>
      {/* Selected colors preview */}
      {selectedColors.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <p className="text-xs text-slate-400 mr-1">Wybrane:</p>
          {selectedColors.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              title={`Usuń ${color}`}
              className="group relative flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono text-slate-700 hover:border-red-200 transition"
            >
              <span
                className="inline-block h-4 w-4 rounded-full border border-slate-200 shrink-0"
                style={{ backgroundColor: color }}
              />
              {color}
              <span className="text-slate-300 group-hover:text-red-400 ml-1">✕</span>
            </button>
          ))}
        </div>
      )}

      {/* Palette */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PALETTE_COLORS.map((c) => {
          const selected = selectedColors.includes(c.hex);
          return (
            <button
              key={c.hex}
              onClick={() => toggleColor(c.hex)}
              title={`${c.name} ${c.hex}`}
              className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                selected
                  ? "border-emerald-500 scale-110 shadow-md"
                  : "border-slate-200 hover:border-slate-400 hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px]">
                  {c.hex === "#ffffff" || c.hex === "#f1f5f9" || c.hex === "#fef3c7" ? "✓" : (
                    <span className="text-white">✓</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom hex input */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span
            className="h-6 w-6 rounded-full border border-slate-200 shrink-0 transition"
            style={{
              backgroundColor: customHex
                ? customHex.startsWith("#")
                  ? customHex
                  : `#${customHex}`
                : "#e2e8f0",
            }}
          />
          <span className="text-slate-400 text-sm">#</span>
          <input
            value={customHex.replace("#", "")}
            onChange={(e) => {
              setCustomHex(e.target.value);
              setCustomError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="FF5733"
            maxLength={6}
            className="flex-1 bg-transparent text-sm font-mono outline-none text-slate-800 placeholder:text-slate-300"
          />
        </div>
        <button
          onClick={addCustom}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition"
        >
          + Dodaj
        </button>
      </div>
      {customError && <p className="mt-1.5 text-xs text-red-500">{customError}</p>}
      <p className="mt-1.5 text-xs text-slate-400">Maksymalnie 5 kolorów marki</p>
    </div>
  );
}

export default function EditBrandPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [brandStyle, setBrandStyle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/profile", { method: "GET", cache: "no-store" });
        const json = await res.json();
        if (!res.ok) { setMsg(json.error || "Failed to load profile."); return; }
        const data: BrandProfile = json.data || {};
        setCompany(data.company || "");
        setIndustry(data.industry || "");
        setTone(data.tone || "");
        setOffer(data.offer || "");
        setAudience(data.audience || "");
        setBrandStyle(data.brand_style || "");
        // Parse saved colors
        if (data.brand_colors) {
          try {
            const parsed = JSON.parse(data.brand_colors);
            if (Array.isArray(parsed)) setBrandColors(parsed);
          } catch {
            // legacy string format
            setBrandColors(data.brand_colors.split(",").map((c: string) => c.trim()).filter(Boolean));
          }
        }
      } catch {
        setMsg("Connection error.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg("");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          industry,
          tone,
          offer,
          audience,
          brand_colors: JSON.stringify(brandColors),
          brand_style: brandStyle,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setMsg(json.error || "Failed to save."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setMsg("Connection error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce block mb-3">🌱</span>
          <p className="text-slate-500 text-sm">Loading your brand profile...</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
        <div className="text-center">
          <span className="text-5xl block mb-4">✅</span>
          <h2 className="text-xl font-bold text-slate-900">Brand profile saved!</h2>
          <p className="text-slate-500 mt-2 text-sm">Redirecting to dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] p-4 lg:p-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
          >
            ‹
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Brand Profile</h1>
            <p className="text-sm text-slate-500">Help AI understand your brand</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <span className="text-xl shrink-0">🧠</span>
          <p className="text-sm text-emerald-800 leading-relaxed">
            The more detail you add, the better your AI-generated content will be. Take 2 minutes to fill this in properly.
          </p>
        </div>

        <div className="space-y-4">

          {/* Company name */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Company / Brand name <span className="text-emerald-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">What is your brand called?</p>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              placeholder="e.g. DiGin, Studio Marta, Fresh Bakes"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {/* Industry */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Industry <span className="text-emerald-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">What sector does your business operate in?</p>
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">Select your industry...</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Tone of voice */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Tone of voice <span className="text-emerald-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">How does your brand communicate?</p>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    tone === opt.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand colors */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              🎨 Kolory marki
            </label>
            <p className="text-xs text-slate-400 mb-4">
              Wybierz z palety lub wpisz własny kod hex. AI użyje tych kolorów do generowania obrazów.
            </p>
            <ColorPicker selectedColors={brandColors} onChange={setBrandColors} />
          </div>

          {/* Brand visual style */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              ◈ Styl wizualny marki
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Jaki jest charakter wizualny Twojej marki? AI dopasuje obrazy do tego stylu.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBrandStyle(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    brandStyle === opt.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offer */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              What do you offer? <span className="text-emerald-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">Describe your product or service in 1-2 sentences.</p>
            <textarea
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              placeholder="e.g. We create professional websites, logos and social media management for small businesses in the Netherlands."
              rows={3}
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
            />
          </div>

          {/* Target audience */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Target audience <span className="text-emerald-500">*</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">Who are your ideal customers?</p>
            <textarea
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              placeholder="e.g. Small business owners in the Netherlands, age 25-45, who want to grow their online presence but don't have time to do it themselves."
              rows={3}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 pb-8">
            <button
              onClick={handleSave}
              disabled={saving || !company || !offer || !audience}
              className="flex-1 rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : "💾 Save brand profile"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>

          {msg && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {msg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BrandProfile = {
  company: string;
  industry: string;
  tone: string;
  offer: string;
  audience: string;
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

export default function EditBrandPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");

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
        body: JSON.stringify({ company, industry, tone, offer, audience }),
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
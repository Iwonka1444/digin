"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", emoji: "💼", desc: "Trustworthy & reliable" },
  { value: "casual", label: "Casual", emoji: "😊", desc: "Friendly & approachable" },
  { value: "bold", label: "Bold", emoji: "🔥", desc: "Confident & direct" },
  { value: "funny", label: "Funny", emoji: "😄", desc: "Playful & fun" },
  { value: "inspiring", label: "Inspiring", emoji: "✨", desc: "Motivational & uplifting" },
  { value: "luxury", label: "Luxury", emoji: "👑", desc: "Premium & exclusive" },
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

const STEPS = [
  { id: 1, title: "What's your brand called?", emoji: "🏷️" },
  { id: 2, title: "What's your industry?", emoji: "🏢" },
  { id: 3, title: "How does your brand talk?", emoji: "💬" },
  { id: 4, title: "What do you offer?", emoji: "🎁" },
  { id: 5, title: "Who's your audience?", emoji: "🎯" },
];

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const progress = ((step - 1) / STEPS.length) * 100;

  const canProceed = () => {
    if (step === 1) return company.trim().length > 0;
    if (step === 2) return industry.length > 0;
    if (step === 3) return tone.length > 0;
    if (step === 4) return offer.trim().length > 0;
    if (step === 5) return audience.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < STEPS.length) setStep(step + 1);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg("");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setMsg("Not logged in."); return; }
      const { error } = await supabase.from("brand_profiles").upsert({
        user_id: user.id,
        company,
        industry,
        tone,
        offer,
        audience,
      }, { onConflict: "user_id" });
      if (error) { setMsg(error.message); return; }
      router.push("/dashboard");
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow-sm">
            D
          </div>
          <p className="mt-2 text-sm text-slate-500">Let's set up your brand 🌱</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Step {step} of {STEPS.length}</p>
            <p className="text-xs text-emerald-600 font-medium">{Math.round(progress)}% done</p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-2 w-2 rounded-full transition-all ${
                  s.id < step ? "bg-emerald-500" :
                  s.id === step ? "bg-emerald-400 scale-125" :
                  "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-4xl mb-3">{currentStep.emoji}</div>
            <h2 className="text-xl font-bold text-slate-900">{currentStep.title}</h2>
          </div>

          {step === 1 && (
            <div>
              <p className="text-sm text-slate-500 mb-4 text-center">This is how your brand will be known in DiGin.</p>
              <input
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition text-center text-base font-medium"
                placeholder="e.g. Studio Marta, Fresh Bakes..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-slate-500 mb-4 text-center">This helps AI understand your market context.</p>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setIndustry(opt)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                      industry === opt
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm text-slate-500 mb-4 text-center">Pick the voice that feels most like your brand.</p>
              <div className="grid grid-cols-2 gap-3">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`rounded-xl border p-3 text-left transition ${
                      tone === opt.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-200"
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className={`text-sm font-semibold ${tone === opt.value ? "text-emerald-800" : "text-slate-800"}`}>{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm text-slate-500 mb-4 text-center">Describe what you sell or do in 1-2 sentences.</p>
              <textarea
                autoFocus
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                placeholder="e.g. We create professional websites, logos and social media content for small businesses in the Netherlands."
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
              />
            </div>
          )}

          {step === 5 && (
            <div>
              <p className="text-sm text-slate-500 mb-4 text-center">Who are your ideal customers? Be specific.</p>
              <textarea
                autoFocus
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                placeholder="e.g. Small business owners in the Netherlands, age 25-45, who want to grow their online presence."
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
          )}

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                ‹ Back
              </button>
            )}
            {step < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canProceed() || saving}
                className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Setting up..." : "🌱 Start growing →"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          {STEPS.map((s) => (
            <span key={s.id} className={`text-base transition-all ${s.id === step ? "opacity-100 scale-125" : "opacity-30"}`}>
              {s.emoji}
            </span>
          ))}
        </div>

      </div>
    </main>
  );
}
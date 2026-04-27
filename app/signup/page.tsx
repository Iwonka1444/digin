"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

const BENEFITS = [
  { icon: "✨", text: "AI posts in seconds" },
  { icon: "📅", text: "Plan your whole week" },
  { icon: "🌱", text: "Watch your brand grow" },
  { icon: "💬", text: "Engagement on autopilot" },
];

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      setMsg("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      setMsg("");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setMsg(error.message); return; }
      setSuccess(true);
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-slate-900">You&apos;re almost in!</h2>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-slate-800">{email}</span>.
            <br />Click it to activate your account and start growing.
          </p>
          <Link
            href="/login"
            className="mt-6 block w-full rounded-xl bg-emerald-500 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald-600 transition"
          >
            Go to login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white text-2xl font-bold shadow-sm">
            D
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">Your brand. Growing. Every day.</p>
        </div>

        {/* Benefits strip */}
        <div className="mb-6 grid grid-cols-2 gap-2">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-3 py-2.5">
              <span className="text-base">{b.icon}</span>
              <span className="text-xs font-medium text-slate-700">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Start for free 🚀</h2>
            <p className="mt-1 text-sm text-slate-500">No credit card required</p>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative mb-6 overflow-visible">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-12 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 015.657 1.757M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create free account →"}
          </button>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Join brands already growing with DiGin 🌱
        </p>
      </div>
    </main>
  );
}
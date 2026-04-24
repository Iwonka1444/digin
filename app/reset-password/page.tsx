"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) { setMsg("Please enter your email."); return; }
    try {
      setLoading(true);
      setMsg("");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://digin-two.vercel.app/update-password",
      });
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
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-2xl font-bold text-slate-900">Check your inbox</h2>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">
            We sent a reset link to{" "}
            <span className="font-semibold text-slate-800">{email}</span>.
            <br />Click it to set a new password.
          </p>
          <Link
            href="/login"
            className="mt-6 block w-full rounded-xl bg-emerald-500 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald-600 transition"
          >
            Back to login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white text-2xl font-bold shadow-sm">
            D
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">AI Marketing Assistant 🌱</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <div className="text-3xl mb-3">🔑</div>
            <h2 className="text-xl font-bold text-slate-900">Forgot your password?</h2>
            <p className="mt-1 text-sm text-slate-500">No worries - we'll send you a reset link.</p>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link →"}
          </button>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
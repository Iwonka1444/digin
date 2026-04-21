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
    if (!email) {
      setMsg("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://digin-two.vercel.app/update-password",
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      setSuccess(true);
    } catch (error) {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ee] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-sm text-lg font-semibold">
            D
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">AI Content Operating System</p>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          {success ? (
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                ✅
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Check your email</h2>
              <p className="mt-2 text-sm text-slate-500">
                We sent a password reset link to <span className="font-medium text-slate-700">{email}</span>.
              </p>
              <Link
                href="/login"
                className="mt-6 block w-full rounded-2xl bg-black py-3 text-center text-sm font-medium text-white"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Password reset</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Forgot your password?</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className="mb-6 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
              />

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}

              <p className="mt-6 text-center text-sm text-slate-500">
                Remember your password?{" "}
                <Link href="/login" className="font-medium text-slate-900 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
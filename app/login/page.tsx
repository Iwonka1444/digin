"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMsg("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMsg(error.message);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ee] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-sm text-lg font-semibold">
            D
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">AI Content Operating System</p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-white/70 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Welcome back</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Sign in to DiGin</h2>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
          />

          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-6 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {msg && (
            <p className="mt-4 text-sm text-red-600">{msg}</p>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-slate-900 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
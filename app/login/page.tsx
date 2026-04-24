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
      if (error) { setMsg(error.message); return; }
      router.push("/dashboard");
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white text-2xl font-bold shadow-sm">
            D
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">AI Marketing Assistant 🌱</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Welcome back 👋</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to grow your brand</p>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />

          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link href="/reset-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </main>
  );
}
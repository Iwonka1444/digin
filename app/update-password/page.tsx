"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!password || !confirm) { setMsg("Please fill in all fields."); return; }
    if (password !== confirm) { setMsg("Passwords do not match."); return; }
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    try {
      setLoading(true);
      setMsg("");
      const { error } = await supabase.auth.updateUser({ password });
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
          <h1 className="mt-3 text-2xl font-bold text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">AI Marketing Assistant 🌱</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="text-xl font-bold text-slate-900">Set a new password</h2>
            <p className="mt-1 text-sm text-slate-500">Choose something strong and memorable.</p>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
          <input
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password →"}
          </button>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {msg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
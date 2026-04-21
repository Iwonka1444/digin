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
    if (!password || !confirm) {
      setMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const { error } = await supabase.auth.updateUser({ password });

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
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-sm text-lg font-semibold">
            D
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">DiGin</h1>
          <p className="mt-1 text-sm text-slate-500">AI Content Operating System</p>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">New password</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Set a new password</h2>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
          />

          <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
          <input
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            className="mb-6 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-black"
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>

          {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
        </div>
      </div>
    </main>
  );
}
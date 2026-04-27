"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = async () => {
    if (!topic) return;

    try {
      setLoading(true);
      setOutput("");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          platform: "Instagram",
          type: "Sales post",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setOutput(data.output);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold text-slate-900">
          Generate Post
        </h1>

        {/* INPUT */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-500">
            What do you want to post about?
          </p>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. promotion 25% or new website offer"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
            rows={3}
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg font-medium hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* OUTPUT */}
        {output && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">

            <p className="text-xs text-slate-400 mb-2">
              Generated post:
            </p>

            {/* 🔥 TU JEST FIX ODSTĘPÓW */}
            <div className="space-y-2 text-sm text-slate-800 leading-snug">
              {output.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
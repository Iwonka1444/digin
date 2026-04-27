"use client";

import { useState } from "react";

function formatOutput(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [type, setType] = useState("Sales post");
  const [length, setLength] = useState("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Write a topic first.");
      return;
    }

    try {
      setLoading(true);
      setOutput("");
      setError("");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          type,
          length,
          includeHashtags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed.");
        return;
      }

      setOutput(formatOutput(data.output || ""));
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] p-4 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-600">DiGin AI</p>
          <h1 className="text-2xl font-bold text-slate-950">
            Generate a social post
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Write even a messy idea. DiGin will turn it into a stronger post.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-800">
            Topic
          </label>
          <p className="mb-3 mt-1 text-xs text-slate-400">
            Example: promocja 25%, logo dla małej firmy, strona internetowa
          </p>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. promocja 25%"
            className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none"
            >
              <option>Instagram</option>
              <option>Facebook</option>
              <option>LinkedIn</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none"
            >
              <option>Sales post</option>
              <option>Educational</option>
              <option>Storytelling</option>
            </select>

            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Add hashtags
          </label>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate post"}
          </button>
        </section>

        {output && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Generated post
                </p>
                <p className="text-sm text-slate-500">
                  Clean spacing, ready to copy.
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Copy
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-snug text-slate-800">
              {output.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
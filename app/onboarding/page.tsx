"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setMsg("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMsg("Nie jesteś zalogowana.");
      return;
    }

    const { error } = await supabase.from("brand_profiles").insert({
      user_id: user.id,
      company,
      industry,
      tone,
      offer,
      audience,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Profil marki zapisany.");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">Onboarding marki</h1>

        <input
          className="w-full border rounded p-3"
          placeholder="Nazwa firmy"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          className="w-full border rounded p-3"
          placeholder="Branża"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />

        <input
          className="w-full border rounded p-3"
          placeholder="Tone of voice"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        />

        <input
          className="w-full border rounded p-3"
          placeholder="Oferta"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
        />

        <textarea
          className="w-full border rounded p-3"
          placeholder="Grupa docelowa"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="w-full bg-black text-white rounded p-3"
        >
          Zapisz profil marki
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </main>
  );
}
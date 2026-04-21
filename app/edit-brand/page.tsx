"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BrandProfile = {
  company: string;
  industry: string;
  tone: string;
  offer: string;
  audience: string;
};

export default function EditBrandPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setMsg("");

        const res = await fetch("/api/profile", {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          setMsg(json.error || "Nie udało się pobrać profilu.");
          return;
        }

        const data: BrandProfile = json.data;

        setCompany(data.company || "");
        setIndustry(data.industry || "");
        setTone(data.tone || "");
        setOffer(data.offer || "");
        setAudience(data.audience || "");
      } catch (error) {
        console.error(error);
        setMsg("Błąd połączenia przy pobieraniu profilu.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg("");

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          industry,
          tone,
          offer,
          audience,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMsg(json.error || "Nie udało się zapisać zmian.");
        return;
      }

      setMsg("Profil marki zaktualizowany ✅");

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (error) {
      console.error(error);
      setMsg("Błąd połączenia przy zapisie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen p-10 bg-[#f7f4ef]">
      <div className="max-w-2xl bg-white rounded-2xl p-6 border">
        <h1 className="text-3xl font-bold">Edit brand profile</h1>
        <p className="mt-2 text-gray-500">
          Zmień dane marki, które DiGin wykorzystuje do generowania treści.
        </p>

        {loading ? (
          <p className="mt-6">Ładuję dane...</p>
        ) : (
          <div className="mt-6 space-y-4">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Nazwa firmy"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Branża"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Tone of voice"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3"
              placeholder="Oferta"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
            />

            <textarea
              className="w-full border rounded-xl p-3"
              placeholder="Grupa docelowa"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-black text-white px-4 py-3 disabled:opacity-50"
              >
                {saving ? "Zapisuję..." : "Zapisz zmiany"}
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-xl border px-4 py-3"
              >
                Wróć
              </button>
            </div>

            {msg && <p className="text-sm">{msg}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
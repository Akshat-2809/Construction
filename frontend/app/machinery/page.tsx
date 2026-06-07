"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MachineCard from "@/components/machinery/machineCard";
import type { Machine } from "@/types/machine";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

function CraneLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <style>{`
        @keyframes crane-swing {
          0%, 100% { transform: rotate(-6deg); }
          50%       { transform: rotate(6deg); }
        }
        @keyframes crane-dot {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50%       { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
      <div style={{ animation: "crane-swing 2s ease-in-out infinite", transformOrigin: "top center" }}>
        <Image src="/crane-loader.webp" alt="Loading…" width={100} height={100} style={{ objectFit: "contain" }} />
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#FFD000",
              animation: `crane-dot 0.9s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MachineryPage() {
  const { user, loading: authLoading } = useRequireAuth();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    if (!user) return;
    async function loadMachines() {
      try {
        const res = await fetch(`${API_URL}/api/machines`);
        if (!res.ok) throw new Error("Failed to load machines");
        const data = await res.json();
        setMachines(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadMachines();
  }, [user]);

  // Show spinner while checking auth (redirects if not logged in)
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-ink" />
      </div>
    );
  }

  const filtered = machines.filter((m: Machine) => {
    const q = query.toLowerCase();
    return (
      (m.company ?? "").toLowerCase().includes(q) ||
      (m.model ?? "").toLowerCase().includes(q) ||
      (m.category ?? "").toLowerCase().includes(q) ||
      (m.location ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t.browseTitle}
        </h1>
        <p className="mt-3 text-lg text-neutral-600">{t.browseSubtext}</p>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative max-w-xl">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.browseSearchPlaceholder}
            className="w-full rounded-full border border-neutral-300 bg-white py-3.5 pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink"
          />
        </div>
        {!loading && !error && (
          <p className="mt-3 text-sm text-neutral-500">
            {filtered.length} {filtered.length === 1 ? t.browseMachineFound : t.browseMachinesFound}
          </p>
        )}
      </div>

      {/* Can't find banner */}
      {!loading && !error && (
        <Link
          href="/machinery/request"
          className="mb-10 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-4 transition-colors hover:border-neutral-400 hover:bg-mist"
        >
          <div>
            <p className="font-semibold text-ink">{t.browseCantFind}</p>
            <p className="mt-0.5 text-sm text-neutral-500">{t.browseCantFindSub}</p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      )}

      {loading && <CraneLoader />}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-16 text-center">
          <p className="font-semibold text-red-600">{error}</p>
          <p className="mt-1 text-sm text-red-400">Make sure the backend server is running.</p>
        </div>
      )}

      {!loading && !error && (
        filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {filtered.map((machine: Machine) => (
              <MachineCard key={machine._id ?? machine.id} machine={machine} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 py-20 text-center text-neutral-400">
            {machines.length === 0
              ? t.browseNoMachines
              : `${t.browseNoMatch} "${query}". ${t.browseTryDifferent}`}
          </div>
        )
      )}
    </div>
  );
}
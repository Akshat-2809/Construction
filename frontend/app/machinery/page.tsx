"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import MachineCard from "@/components/machinery/machineCard";
import type { Machine } from "@/types/machine";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { categories } from "@/lib/machineOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";

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

function Dropdown({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm outline-none transition-colors ${
          open ? "border-ink" : "border-neutral-300"
        } ${selected ? "text-ink" : "text-neutral-400"}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-60 w-full min-w-[10rem] overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 ${
              !value ? "font-semibold text-ink" : "text-neutral-600"
            }`}
          >
            {placeholder}
            {!value && (
              <svg className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 ${
                value === o.value ? "font-semibold text-ink" : "text-neutral-600"
              }`}
            >
              <span className="truncate">{o.label}</span>
              {value === o.value && (
                <svg className="h-4 w-4 shrink-0 text-ink" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
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

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [modelYearFilter, setModelYearFilter] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

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

  // Close sort menu when clicking outside
  useEffect(() => {
    if (!sortMenuOpen) return;
    const handler = () => setSortMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [sortMenuOpen]);

  // Distinct locations present in the current data, for the location dropdown
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    machines.forEach((m) => {
      if (m.location) set.add(m.location);
    });
    return [...set].sort();
  }, [machines]);

  // Distinct model years present in the current data, for the model year dropdown
  const availableModelYears = useMemo(() => {
    const set = new Set<number>();
    machines.forEach((m) => {
      if (m.modelYear) set.add(m.modelYear);
    });
    return [...set].sort((a, b) => b - a);
  }, [machines]);

  const hasActiveFilters =
    !!categoryFilter ||
    !!locationFilter ||
    !!availabilityFilter ||
    !!minPrice ||
    !!maxPrice ||
    !!modelYearFilter;

  function clearFilters() {
    setCategoryFilter("");
    setLocationFilter("");
    setAvailabilityFilter("");
    setMinPrice("");
    setMaxPrice("");
    setModelYearFilter("");
    setShowFilters(false);
  }

  // Show spinner while checking auth (redirects if not logged in)
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-ink" />
      </div>
    );
  }

  const filtered = machines
    .filter((m: Machine) => {
      const q = query.toLowerCase();
      const matchesQuery =
        (m.company ?? "").toLowerCase().includes(q) ||
        (m.model ?? "").toLowerCase().includes(q) ||
        (m.category ?? "").toLowerCase().includes(q) ||
        (m.location ?? "").toLowerCase().includes(q);

      const matchesCategory = !categoryFilter || m.category === categoryFilter;
      const matchesLocation = !locationFilter || m.location === locationFilter;
      const matchesAvailability = !availabilityFilter || m.availability === availabilityFilter;

      const price = m.pricePerMonth ?? 0;
      const matchesMinPrice = !minPrice || price >= Number(minPrice);
      const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);

      const matchesModelYear = !modelYearFilter || m.modelYear === Number(modelYearFilter);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesLocation &&
        matchesAvailability &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesModelYear
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return (a.pricePerMonth ?? 0) - (b.pricePerMonth ?? 0);
      if (sortBy === "price-desc") return (b.pricePerMonth ?? 0) - (a.pricePerMonth ?? 0);
      // newest first
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
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
      <div className="mb-4">
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
      </div>

      {/* Filters toggle + Sort */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
            hasActiveFilters
              ? "border-ink bg-ink text-white"
              : "border-neutral-300 bg-white text-ink hover:bg-mist"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          {t.browseFiltersToggle}
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hivis text-xs font-bold text-ink">
              {[categoryFilter, locationFilter, availabilityFilter, minPrice, maxPrice, modelYearFilter].filter(Boolean).length}
            </span>
          )}
          <svg className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Sort */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSortMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mist"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            {t.browseSort}
            <svg className={`h-4 w-4 text-neutral-400 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {sortMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
              {([
                ["newest", t.browseSortNewest],
                ["price-asc", t.browseSortPriceLowHigh],
                ["price-desc", t.browseSortPriceHighLow],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSortBy(value); setSortMenuOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 ${
                    sortBy === value ? "font-semibold text-ink" : "text-neutral-600"
                  }`}
                >
                  {label}
                  {sortBy === value && (
                    <svg className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:border-neutral-400 hover:text-ink"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            {t.browseFilterClear}
          </button>
        )}
      </div>

      {/* Collapsible filter panel */}
      {showFilters && (
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Category */}
            <Dropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder={t.browseFilterAllCategories}
              options={categories.map((c: string) => ({ value: c, label: c }))}
            />

            {/* Location */}
            <Dropdown
              value={locationFilter}
              onChange={setLocationFilter}
              placeholder={t.browseFilterAllLocations}
              options={availableLocations.map((l) => ({ value: l, label: l }))}
            />

            {/* Availability */}
            <Dropdown
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
              placeholder={t.browseFilterAllAvailability}
              options={[
                { value: "yes", label: t.browseFilterAvailableNow },
                { value: "no", label: t.browseFilterBusy },
              ]}
            />

            {/* Model year */}
            <Dropdown
              value={modelYearFilter}
              onChange={setModelYearFilter}
              placeholder={t.browseFilterAllYears}
              options={availableModelYears.map((y) => ({ value: String(y), label: String(y) }))}
            />

            {/* Price range */}
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t.browseFilterMinPrice}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t.browseFilterMaxPrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Apply — mobile only, closes the filter panel so results are visible */}
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="mt-4 w-full rounded-full bg-hivis px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-hivis-dark sm:hidden"
          >
            {t.browseFilterApply}
          </button>
        </div>
      )}

      {!loading && !error && (
        <p className="mb-8 text-sm text-neutral-500">
          {filtered.length} {filtered.length === 1 ? t.browseMachineFound : t.browseMachinesFound}
        </p>
      )}

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
              : hasActiveFilters && !query
              ? `${t.browseNoMatch}. ${t.browseTryDifferent}`
              : `${t.browseNoMatch} "${query}". ${t.browseTryDifferent}`}
          </div>
        )
      )}
    </div>
  );
}
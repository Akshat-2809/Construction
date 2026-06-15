"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { locations } from "@/lib/machineOptions";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import type { Machine } from "@/types/machine";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";
const selectClass = `${inputClass} appearance-none`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

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

export default function MyListingsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { lang } = useLang();
  const t = translations[lang];

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState<Machine | null>(null);
  const [editForm, setEditForm] = useState({
    location: "",
    customLocation: "",
    pricePerMonth: "",
    ownerName: "",
    description: "",
    availability: "yes",
    availableFrom: "",
    modelYear: "",
    hoursUsed: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch(`${API_URL}/api/machines`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: Machine[]) => {
        if (!cancelled) {
          setMachines(data.filter((m) => m.ownerId === user._id));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  function openEdit(machine: Machine) {
    setEditTarget(machine);
    setEditError("");
    const loc = locations.includes(machine.location) ? machine.location : "Other";
    setEditForm({
      location: loc,
      customLocation: loc === "Other" ? machine.location : "",
      pricePerMonth: String(machine.pricePerMonth),
      ownerName: machine.ownerName,
      description: machine.description ?? "",
      availability: machine.availability,
      availableFrom: machine.availableFrom ?? "",
      modelYear: machine.modelYear ? String(machine.modelYear) : "",
      hoursUsed: machine.hoursUsed ? String(machine.hoursUsed) : "",
    });
  }

  function updateEdit(field: string, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveEdit() {
    if (!editTarget) return;
    const finalLocation =
      editForm.location === "Other"
        ? editForm.customLocation.trim()
        : editForm.location;
    if (!finalLocation) {
      setEditError(t.regErrorCity);
      return;
    }
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch(`${API_URL}/api/machines/${editTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          location: finalLocation,
          pricePerMonth: Number(editForm.pricePerMonth),
          ownerName: editForm.ownerName,
          description: editForm.description,
          availability: editForm.availability,
          availableFrom:
            editForm.availability === "no" ? editForm.availableFrom : null,
          modelYear: editForm.modelYear ? Number(editForm.modelYear) : undefined,
          hoursUsed: editForm.hoursUsed ? Number(editForm.hoursUsed) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update");
      }
      const updated: Machine = await res.json();
      setMachines((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
      setEditTarget(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/machines/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMachines((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  if (authLoading || !user) {
    return <CraneLoader />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">{t.myListingsTitle}</h1>
          <p className="mt-1 text-neutral-500">{t.myListingsSubtext}</p>
        </div>
        <Link
          href="/machinery/register"
          className="inline-flex items-center gap-2 rounded-full bg-hivis px-5 py-2.5 text-sm font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t.myListingsAdd}
        </Link>
      </div>

      {/* Loading */}
      {loading && <CraneLoader />}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
          <p className="font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && machines.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
          <p className="text-lg font-semibold text-ink">{t.myListingsEmpty}</p>
          <p className="mt-1 text-neutral-500">{t.myListingsEmptySub}</p>
          <Link
            href="/machinery/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            {t.myListingsListBtn}
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && machines.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <div
              key={machine._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-md"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={machine.image || "/excavator.webp"}
                  alt={`${machine.company} ${machine.model}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm">
                  {machine.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                    {machine.category}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                    machine.availability === "yes" ? "text-green-600" : "text-orange-500"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      machine.availability === "yes" ? "bg-green-500" : "bg-orange-400"
                    }`} />
                    {machine.availability === "yes" ? t.myListingsAvailable : t.myListingsBusy}
                  </span>
                </div>

                <p className="font-semibold text-ink">
                  {machine.company} {machine.model}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">{machine.location}</p>

                <p className="mt-3 text-lg font-bold text-ink">
                  ₹{machine.pricePerMonth?.toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-neutral-400">/mo</span>
                </p>

                <p className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                  {t.myListingsListed}{" "}
                  {new Date(machine.createdAt!).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(machine)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    {t.myListingsEdit}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(machine)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    {t.myListingsDelete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-ink">{t.myListingsEditTitle}</h2>
                <p className="text-sm text-neutral-500">
                  {editTarget.company} {editTarget.model}
                </p>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
              >
                <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">

              <Field label={t.myListingsLocation}>
                <select
                  value={editForm.location}
                  onChange={(e) => {
                    updateEdit("location", e.target.value);
                    updateEdit("customLocation", "");
                  }}
                  className={selectClass}
                >
                  <option value="" disabled>{t.myListingsSelectLocation}</option>
                  {[...locations].sort().map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {editForm.location === "Other" && (
                  <input
                    type="text"
                    placeholder={t.myListingsEnterCity}
                    value={editForm.customLocation}
                    onChange={(e) => updateEdit("customLocation", e.target.value)}
                    className={`${inputClass} mt-2`}
                    autoFocus
                  />
                )}
              </Field>

              <Field label={t.myListingsRate}>
                <input
                  type="number"
                  min={0}
                  value={editForm.pricePerMonth}
                  onChange={(e) => updateEdit("pricePerMonth", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={t.myListingsModelYear}>
                  <input
                    type="number"
                    min={1990}
                    max={2026}
                    placeholder="e.g. 2020"
                    value={editForm.modelYear}
                    onChange={(e) => updateEdit("modelYear", e.target.value.slice(0, 4))}
                    className={inputClass}
                  />
                </Field>
                <Field label={t.myListingsHoursUsed}>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 3400"
                    value={editForm.hoursUsed}
                    onChange={(e) => updateEdit("hoursUsed", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label={t.myListingsOwnerName}>
                <input
                  type="text"
                  value={editForm.ownerName}
                  onChange={(e) =>
                    updateEdit("ownerName", e.target.value.replace(/[0-9]/g, ""))
                  }
                  className={inputClass}
                />
              </Field>

              <div>
                <label className="mb-3 block text-sm font-semibold text-ink">
                  {t.myListingsAvailability}
                </label>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        updateEdit("availability", val);
                        if (val === "yes") updateEdit("availableFrom", "");
                      }}
                      className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors ${
                        editForm.availability === val
                          ? "border-ink bg-ink text-white"
                          : "border-neutral-300 bg-white text-ink hover:bg-neutral-50"
                      }`}
                    >
                      {val === "yes" ? t.myListingsAvailable : t.myListingsBusy}
                    </button>
                  ))}
                </div>
                {editForm.availability === "no" && (
                  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <label className="mb-2 block text-sm font-semibold text-ink">
                      {t.myListingsAvailableFrom}
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={editForm.availableFrom}
                      onChange={(e) => updateEdit("availableFrom", e.target.value)}
                      className={`${inputClass} max-w-xs`}
                    />
                  </div>
                )}
              </div>

              <Field label={t.myListingsDescription}>
                <textarea
                  rows={2}
                  placeholder={t.myListingsDescPlaceholder}
                  value={editForm.description}
                  onChange={(e) => updateEdit("description", e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {editError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </p>
              )}
            </div>

            <div className="flex gap-3 border-t border-neutral-100 px-6 py-4">
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 rounded-full border border-neutral-200 py-3 text-sm font-semibold text-ink hover:bg-neutral-50"
              >
                {t.myListingsCancel}
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="flex-1 rounded-full bg-hivis py-3 text-sm font-bold text-ink transition-all hover:bg-hivis-dark disabled:opacity-60"
              >
                {editSaving ? t.myListingsSaving : t.myListingsSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">{t.myListingsDeleteTitle}</h3>
            <p className="mt-2 text-sm text-neutral-500">
              <span className="font-semibold text-ink">
                {deleteTarget.company} {deleteTarget.model}
              </span>{" "}
              {t.myListingsDeleteMsg}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-neutral-200 py-3 text-sm font-semibold text-ink hover:bg-neutral-50"
              >
                {t.myListingsCancel}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? t.myListingsDeleting : t.myListingsDelete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
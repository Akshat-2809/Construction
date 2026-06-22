"use client";

import { useState } from "react";
import Image from "next/image";
import { Machine } from "@/types/machine";
import { useAuth } from "@/context/AuthContext";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/machines`;

export default function MachineCard({ machine }: { machine: Machine }) {
  const { user, getAuthHeader } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  // Build image list: use images[] if available, else fall back to image
  const imageList = (machine.images && machine.images.length > 0)
    ? machine.images
    : [machine.image];

  const [form, setForm] = useState({
    pricePerMonth: String(machine.pricePerMonth ?? ""),
    location: machine.location ?? "",
    ownerName: machine.ownerName ?? "",
    ownerContact: machine.ownerContact ?? "",
    description: machine.description ?? "",
    availability: machine.availability ?? "yes",
    availableFrom: machine.availableFrom
      ? new Date(machine.availableFrom).toISOString().split("T")[0]
      : "",
    modelYear: String(machine.modelYear ?? ""),
    hoursUsed: String(machine.hoursUsed ?? ""),
  });

  const isAvailable = machine.availability === "yes";
  // Owner check — show edit/delete only to the user who listed it
  const isOwner = !!user && user._id === machine.ownerId;
  const displayName = `${machine.company} ${machine.model}`;
  const todayStr = new Date().toISOString().split("T")[0];

  const availableFromFormatted = machine.availableFrom
    ? new Date(machine.availableFrom).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const id = machine._id ?? machine.id;
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          ...form,
          pricePerMonth: Number(form.pricePerMonth),
          modelYear: form.modelYear ? Number(form.modelYear) : undefined,
          hoursUsed: form.hoursUsed ? Number(form.hoursUsed) : undefined,
          availableFrom:
            form.availability === "no" && form.availableFrom
              ? form.availableFrom
              : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save");
      }
      window.location.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const id = machine._id ?? machine.id;
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-lg">
      {/* Image slider */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={imageList[imgIndex]}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Prev/Next arrows — only if multiple images */}
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + imageList.length) % imageList.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % imageList.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {imageList.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}

        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${isAvailable ? "bg-green-500 text-white" : "bg-neutral-800 text-white"}`}>
          {isAvailable ? "Available" : availableFromFormatted ? `Free from ${availableFromFormatted}` : "Busy"}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm">
          {machine.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-ink">{displayName}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {machine.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-ink">₹{(machine.pricePerMonth ?? 0).toLocaleString("en-IN")}</p>
            <p className="text-xs text-neutral-400">per month</p>
          </div>
        </div>

        {/* Expandable details */}
        <div className={`grid overflow-hidden transition-all duration-300 ${expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0">
            <div className="space-y-2.5 border-t border-neutral-100 pt-4 text-sm">
              <Detail label="Dealer" value={machine.ownerName} />

              {/* Contact — always visible, blue tick if owner is verified */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Contact</span>
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  {machine.ownerContact}
                  {machine.contactVerified && (
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </div>

              <Detail label="Model year" value={String(machine.modelYear ?? "—")} />
              <Detail label="Hours used" value={machine.hoursUsed != null ? `${machine.hoursUsed.toLocaleString("en-IN")} hrs` : "—"} />
              {machine.description && (
                <p className="pt-1 leading-relaxed text-neutral-500">{machine.description}</p>
              )}

              {/* Call dealer — always visible */}
              <a
                href={`tel:${machine.ownerContact.replace(/\s/g, "")}`}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-hivis px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-hivis-dark"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                Call dealer
              </a>

              {/* Edit + Delete — only shown to the owner */}
              {isOwner && (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-neutral-300 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-semibold text-neutral-600 transition-colors hover:text-ink"
        >
          {expanded ? "Show less" : "Show more"}
          <svg className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h2 className="mt-4 text-center text-lg font-bold text-ink">Delete listing?</h2>
            <p className="mt-2 text-center text-sm text-neutral-500">
              This will permanently remove <span className="font-semibold text-ink">{displayName}</span> from ACE. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-full border border-neutral-300 py-2.5 text-sm font-semibold text-ink hover:bg-neutral-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl max-h-[90vh]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Edit listing</h2>
              <button onClick={() => setEditing(false)} className="text-neutral-400 hover:text-ink">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <EditField label="Price per month (₹)">
                <input type="number" value={form.pricePerMonth} onChange={(e) => updateForm("pricePerMonth", e.target.value)} className={inputClass} />
              </EditField>
              <EditField label="Location">
                <input type="text" value={form.location} onChange={(e) => updateForm("location", e.target.value)} className={inputClass} />
              </EditField>
              <EditField label="Owner name">
                <input type="text" value={form.ownerName} onChange={(e) => updateForm("ownerName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} className={inputClass} />
              </EditField>
              <EditField label="Contact number">
                <input type="tel" value={form.ownerContact} onChange={(e) => updateForm("ownerContact", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} className={inputClass} />
              </EditField>
              <EditField label="Model year">
                <input type="number" min={1990} max={2030} value={form.modelYear} onChange={(e) => updateForm("modelYear", e.target.value)} className={inputClass} />
              </EditField>
              <EditField label="Hours used">
                <input type="number" min={0} value={form.hoursUsed} onChange={(e) => updateForm("hoursUsed", e.target.value)} className={inputClass} />
              </EditField>
              <EditField label="Description">
                <textarea rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} className={`${inputClass} resize-none`} />
              </EditField>
              <EditField label="Currently available?">
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((val) => (
                    <button key={val} type="button"
                      onClick={() => { updateForm("availability", val); if (val === "yes") updateForm("availableFrom", ""); }}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize transition-colors ${form.availability === val ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:bg-neutral-50"}`}>
                      {val === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </EditField>
              {form.availability === "no" && (
                <EditField label="Available from">
                  <input type="date" min={todayStr} value={form.availableFrom} onChange={(e) => updateForm("availableFrom", e.target.value)} className={inputClass} />
                </EditField>
              )}

              {saveError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="flex-1 rounded-full border border-neutral-300 py-2.5 text-sm font-semibold text-ink hover:bg-neutral-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";
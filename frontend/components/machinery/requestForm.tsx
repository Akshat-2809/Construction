"use client";

import { useState } from "react";
import {
  categories,
  craneTypes,
  locations,
} from "@/lib/machineOptions";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/requests`;

export default function RequestForm() {
  const { lang } = useLang();
  const t = translations[lang];

  const [form, setForm] = useState({
    category: "",
    craneType: "",
    location: "",
    customLocation: "",
    requiredFrom: "",
    requiredTill: "",
    budgetPerMonth: "",
    description: "",
    contactName: "",
    contactNumber: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isCrane = form.category === "Crane";
  const isOtherLocation = form.location === "Other";
  const finalLocation = isOtherLocation ? form.customLocation.trim() : form.location;
  const todayStr = new Date().toISOString().split("T")[0];

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOtherLocation && !form.customLocation.trim()) {
      setError(t.reqErrorCity);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          location: finalLocation,
          craneType: isCrane ? form.craneType : null,
          budgetPerMonth: form.budgetPerMonth ? Number(form.budgetPerMonth) : null,
          requiredTill: form.requiredTill || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-semibold text-ink">{t.reqSuccessTitle}</h3>
        <p className="mt-2 text-neutral-600">{t.reqSuccessSubtext}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/machinery"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50"
          >
            {t.reqBrowseMachines}
          </a>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                category: "", craneType: "", location: "", customLocation: "",
                requiredFrom: "", requiredTill: "", budgetPerMonth: "",
                description: "", contactName: "", contactNumber: "",
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            {t.reqPostAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <Field label={t.reqMachineNeeded}>
        <select
          required
          value={form.category}
          onChange={(e) => { update("category", e.target.value); update("craneType", ""); }}
          className={selectClass}
        >
          <option value="" disabled>{t.reqSelectMachine}</option>
          <option value="Any">{t.reqAny}</option>
          {categories.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      {isCrane && (
        <Field label={t.reqCraneType}>
          <select
            required
            value={form.craneType}
            onChange={(e) => update("craneType", e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>{t.reqSelectCraneType}</option>
            {craneTypes.map((ct: string) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label={t.reqLocation}>
        <select
          required
          value={form.location}
          onChange={(e) => { update("location", e.target.value); update("customLocation", ""); }}
          className={selectClass}
        >
          <option value="" disabled>{t.reqSelectLocation}</option>
          {[...locations, ...(!locations.includes("Gwalior") ? ["Gwalior"] : [])].sort().map((l: string) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        {isOtherLocation && (
          <input
            type="text"
            required
            placeholder={t.reqCustomLocationPlaceholder}
            value={form.customLocation}
            onChange={(e) => update("customLocation", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
            className={`${inputClass} mt-2`}
            autoFocus
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.reqRequiredFrom}>
          <input
            type="date"
            required
            min={todayStr}
            value={form.requiredFrom}
            onChange={(e) => update("requiredFrom", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t.reqRequiredTill}>
          <input
            type="date"
            min={form.requiredFrom || todayStr}
            value={form.requiredTill}
            onChange={(e) => update("requiredTill", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t.reqBudget}>
        <input
          type="number"
          min={0}
          placeholder="e.g. 20000"
          value={form.budgetPerMonth}
          onChange={(e) => update("budgetPerMonth", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t.reqDetails}>
        <textarea
          rows={3}
          placeholder={t.reqDetailsPlaceholder}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.reqYourName}>
          <input
            type="text"
            required
            placeholder={t.reqNamePlaceholder}
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value.replace(/[0-9]/g, ""))}
            className={inputClass}
          />
        </Field>
        <Field label={t.reqContact}>
          <input
            type="tel"
            required
            maxLength={10}
            inputMode="numeric"
            placeholder={t.reqContactPlaceholder}
            value={form.contactNumber}
            onChange={(e) => update("contactNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={inputClass}
          />
        </Field>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-hivis px-6 py-4 text-base font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {submitting ? t.reqSubmitting : t.reqSubmitBtn}
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";
const selectClass = `${inputClass} appearance-none`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}
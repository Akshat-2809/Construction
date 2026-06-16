"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  categories,
  craneTypes,
  statesAndCities,
  states,
} from "@/lib/machineOptions";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useAuth } from "@/context/AuthContext";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/requests`;

export default function RequestForm() {
  const { lang } = useLang();
  const t = translations[lang];
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    category: "",
    craneType: "",
    state: "",
    customState: "",
    location: "",
    customLocation: "",
    requiredFrom: "",
    requiredTill: "",
    hoursRequired: "",
    budgetPerMonth: "",
    budgetForPeriod: "",
    description: "",
    contactName: user?.name ?? "",
    contactNumber: user?.phone ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isCrane = form.category === "Crane";
  const isOtherState = form.state === "Other";
  const isOtherLocation = form.location === "Other";
  const todayStr = new Date().toISOString().split("T")[0];

  // Detect 1-day rental: both dates set and equal
  const isOneDay = !!(form.requiredFrom && form.requiredTill && form.requiredFrom === form.requiredTill);

  // Detect short period: both dates set, different days, but less than 30 days apart
  const isShortPeriod = !!(
    form.requiredFrom &&
    form.requiredTill &&
    form.requiredFrom !== form.requiredTill &&
    (new Date(form.requiredTill).getTime() - new Date(form.requiredFrom).getTime()) < 30 * 24 * 60 * 60 * 1000
  );

  const availableCities = !isOtherState && form.state
    ? statesAndCities[form.state] ?? []
    : [];

  const finalState = isOtherState ? form.customState.trim() : form.state;
  const finalCity = isOtherLocation ? form.customLocation.trim() : form.location;
  const finalLocation = [finalCity, finalState].filter(Boolean).join(", ");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOtherState && !form.customState.trim()) {
      setError("Please enter your state name.");
      return;
    }
    if (isOtherLocation && !form.customLocation.trim()) {
      setError(t.reqErrorCity);
      return;
    }
    if (isOneDay && !form.hoursRequired) {
      setError("Please enter the number of hours required.");
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
          budgetPerMonth: (!isOneDay && !isShortPeriod) && form.budgetPerMonth ? Number(form.budgetPerMonth) : null,
          budgetForPeriod: (isOneDay || isShortPeriod) && form.budgetForPeriod ? Number(form.budgetForPeriod) : null,
          hoursRequired: isOneDay && form.hoursRequired ? Number(form.hoursRequired) : null,
          requiredTill: form.requiredTill || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }
      setSubmitted(true);
      router.refresh();
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
                category: "", craneType: "",
                state: "", customState: "", location: "", customLocation: "",
                requiredFrom: "", requiredTill: "", hoursRequired: "",
                budgetPerMonth: "", budgetForPeriod: "", description: "",
                contactName: user?.name ?? "",
                contactNumber: user?.phone ?? "",
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
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            required
            value={form.state}
            onChange={(e) => { update("state", e.target.value); update("location", ""); update("customLocation", ""); update("customState", ""); }}
            className={selectClass}
          >
            <option value="" disabled>{t.regSelectState}</option>
            {states.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>

          {isOtherState ? (
            <input
              type="text"
              required
              placeholder={t.regEnterStateName}
              value={form.customState}
              onChange={(e) => update("customState", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
              className={inputClass}
            />
          ) : (
            <select
              required
              value={form.location}
              disabled={!form.state}
              onChange={(e) => { update("location", e.target.value); update("customLocation", ""); }}
              className={`${selectClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400`}
            >
              <option value="" disabled>{form.state ? t.reqSelectLocation : t.regSelectStateFirst}</option>
              {availableCities.map((c: string) => <option key={c} value={c}>{c}</option>)}
              <option value="Other">{t.regOtherCityOption}</option>
            </select>
          )}
        </div>

        {!isOtherState && isOtherLocation && (
          <input
            type="text"
            required
            placeholder={t.reqCustomLocationPlaceholder}
            value={form.customLocation}
            onChange={(e) => update("customLocation", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
            className={`${inputClass} mt-3`}
            autoFocus
          />
        )}
        {isOtherState && (
          <input
            type="text"
            required
            placeholder={t.reqCustomLocationPlaceholder}
            value={form.customLocation}
            onChange={(e) => update("customLocation", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
            className={`${inputClass} mt-3`}
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

      {/* 1-day rental extras — shown when from == till */}
      {isOneDay && (
        <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <Field label="Number of hours required">
            <input
              type="number"
              required
              min={1}
              max={24}
              placeholder="e.g. 8"
              value={form.hoursRequired}
              onChange={(e) => update("hoursRequired", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Budget for the day (₹) — optional">
            <input
              type="number"
              min={0}
              placeholder="e.g. 5000"
              value={form.budgetForPeriod}
              onChange={(e) => update("budgetForPeriod", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {/* Short period (< 30 days, not same day) — budget for the time period */}
      {isShortPeriod && (
        <Field label="Budget for the time period (₹) — optional">
          <input
            type="number"
            min={0}
            placeholder="e.g. 15000"
            value={form.budgetForPeriod}
            onChange={(e) => update("budgetForPeriod", e.target.value)}
            className={inputClass}
          />
        </Field>
      )}

      {/* Monthly or open-ended — budget per month */}
      {!isOneDay && !isShortPeriod && (
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
      )}

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
          <div className="relative">
            <input
              type="tel"
              required
              readOnly={!!user}
              maxLength={10}
              inputMode="numeric"
              placeholder={t.reqContactPlaceholder}
              value={form.contactNumber}
              onChange={(e) => update("contactNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${inputClass} ${user ? "bg-neutral-50 pr-24" : ""}`}
            />
            {user && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
          {user && (
            <p className="mt-1.5 text-xs text-neutral-400">Phone from your account — verified via OTP</p>
          )}
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
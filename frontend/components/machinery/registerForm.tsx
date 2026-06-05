"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  categories,
  craneTypes,
  companiesByCategory,
  companiesByCraneType,
  modelsByCategoryAndCompany,
  craneModelsByTypeAndCompany,
  locations,
} from "@/lib/machineOptions";
import { auth } from "@/lib/firebases";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";

const categoryImageMap: { [key: string]: string } = {
  "Excavator": "/excavator.webp",
  "Concrete Pump": "/concrete.webp",
  "Fiori": "/fiori.webp",
  "JCB": "/jcb.webp",
  "Crane": "/crane.webp",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function RegisterForm() {
  const { lang } = useLang();
  const t = translations[lang];

  const [form, setForm] = useState({
    category: "",
    craneType: "",
    company: "",
    model: "",
    location: "",
    customLocation: "",
    pricePerMonth: "",
    modelYear: "",
    hoursUsed: "",
    ownerName: "",
    ownerContact: "",
    description: "",
    availability: "yes",
    availableFrom: "",
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [savedMachineId, setSavedMachineId] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const isCrane = form.category === "Crane";
  const isOtherLocation = form.location === "Other";
  const defaultImage = categoryImageMap[form.category] ?? "/excavator.webp";

  const availableCompanies = isCrane
    ? form.craneType ? companiesByCraneType[form.craneType] ?? [] : []
    : form.category ? companiesByCategory[form.category] ?? [] : [];

  const availableModels = isCrane
    ? form.craneType && form.company
      ? craneModelsByTypeAndCompany[form.craneType]?.[form.company] ?? []
      : []
    : form.category && form.company
    ? modelsByCategoryAndCompany[form.category]?.[form.company] ?? []
    : [];

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  const finalLocation = isOtherLocation
    ? form.customLocation.trim()
    : form.location;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOtherLocation && !form.customLocation.trim()) {
      setError(t.regErrorCity);
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
          pricePerMonth: Number(form.pricePerMonth),
          modelYear: Number(form.modelYear),
          hoursUsed: Number(form.hoursUsed),
          image: defaultImage,
          availableFrom: form.availability === "no" ? form.availableFrom : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const saved = await res.json();
      setSavedMachineId(saved._id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendOtp() {
    setSendingOtp(true);
    setVerifyError("");
    try {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      recaptchaRef.current = verifier;
      const phoneNumber = `+91${form.ownerContact}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      confirmationRef.current = confirmation;
      setOtpSent(true);
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function confirmOtp() {
    if (!confirmationRef.current || !savedMachineId) return;
    setVerifying(true);
    setVerifyError("");
    try {
      await confirmationRef.current.confirm(otp);
      await fetch(`${API_URL}/${savedMachineId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setVerified(true);
      setShowVerifyModal(false);
    } catch {
      setVerifyError("Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
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
        <h3 className="mt-5 text-xl font-semibold text-ink">{t.regSuccessTitle}</h3>
        <p className="mt-2 text-neutral-600">{t.regSuccessSubtext}</p>

        {!verified ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-6 py-5">
            <p className="text-sm font-semibold text-blue-800">{t.regVerifyTitle}</p>
            <p className="mt-1 text-xs text-blue-600">{t.regVerifySubtext}</p>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="mt-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t.regVerifyBtn}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
            {t.regVerifiedText}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          
          <a
            href="/machinery"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {t.regGoToListings}
          </a>
          <button
            onClick={() => {
              setSubmitted(false);
              setVerified(false);
              setSavedMachineId(null);
              setOtpSent(false);
              setOtp("");
              setForm({
                category: "", craneType: "", company: "", model: "",
                location: "", customLocation: "", pricePerMonth: "",
                modelYear: "", hoursUsed: "", ownerName: "", ownerContact: "",
                description: "", availability: "yes", availableFrom: "",
              });
              setPreview(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            {t.regListAnother}
          </button>
        </div>

        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-left">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">{t.otpTitle}</h2>
                <button onClick={() => setShowVerifyModal(false)} className="text-neutral-400 hover:text-ink">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-neutral-500 mb-4">
                {t.otpSubtext}{" "}
                <span className="font-semibold text-ink">+91 {form.ownerContact}</span>
              </p>

              <div id="recaptcha-container" />

              {!otpSent ? (
                <button
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {sendingOtp ? t.otpSending : t.otpSendBtn}
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t.otpPlaceholder}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-center text-lg font-semibold tracking-widest text-ink outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={confirmOtp}
                    disabled={verifying || otp.length < 6}
                    className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {verifying ? t.otpConfirming : t.otpConfirmBtn}
                  </button>
                  <button
                    onClick={sendOtp}
                    disabled={sendingOtp}
                    className="w-full text-xs text-neutral-400 hover:text-ink"
                  >
                    {t.otpResend}
                  </button>
                </div>
              )}

              {verifyError && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{verifyError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Photo upload */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">{t.regPhotoLabel}</label>
        <div className="flex items-center gap-5">
          <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <Image src={preview ?? defaultImage} alt="Machine preview" fill className="object-cover" sizes="144px" />
            {!preview && (
              <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white">
                {form.category ? `${form.category} (${t.regPhotoDefault})` : t.regPhotoDefault}
              </span>
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mist">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              {t.regPhotoBtn}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            <p className="mt-2 text-xs text-neutral-400">{t.regPhotoHint}</p>
          </div>
        </div>
      </div>

      {/* Category + Crane type / Company */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.regMachineType}>
          <select required value={form.category} onChange={(e) => { update("category", e.target.value); update("craneType", ""); update("company", ""); update("model", ""); }} className={selectClass}>
            <option value="" disabled>{t.regSelectType}</option>
            {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        {isCrane ? (
          <Field label={t.regCraneType}>
            <select required value={form.craneType} onChange={(e) => { update("craneType", e.target.value); update("company", ""); update("model", ""); }} className={selectClass}>
              <option value="" disabled>{t.regSelectCraneType}</option>
              {craneTypes.map((t2: string) => <option key={t2} value={t2}>{t2}</option>)}
            </select>
          </Field>
        ) : (
          <Field label={t.regCompany}>
            <select required value={form.company} disabled={!form.category} onChange={(e) => { update("company", e.target.value); update("model", ""); }} className={`${selectClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400`}>
              <option value="" disabled>{form.category ? t.regSelectCompany : t.regSelectTypeFirst}</option>
              {availableCompanies.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        )}
      </div>

      {isCrane && (
        <Field label={t.regCompany}>
          <select required value={form.company} disabled={!form.craneType} onChange={(e) => { update("company", e.target.value); update("model", ""); }} className={`${selectClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400`}>
            <option value="" disabled>{form.craneType ? t.regSelectCompany : t.regSelectCraneFirst}</option>
            {availableCompanies.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      )}

      {/* Model + Model year */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.regModel}>
          <select required value={form.model} onChange={(e) => update("model", e.target.value)} disabled={!form.company} className={`${selectClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400`}>
            <option value="" disabled>{form.company ? t.regSelectModel : t.regSelectCompanyFirst}</option>
            {availableModels.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={t.regModelYear}>
          <input type="number" required min={1990} max={2026} maxLength={4} placeholder="e.g. 2022" value={form.modelYear} onChange={(e) => update("modelYear", e.target.value.slice(0, 4))} className={inputClass} />
        </Field>
      </div>

      {/* Location + Price */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.regLocation}>
          <select
            required
            value={form.location}
            onChange={(e) => { update("location", e.target.value); update("customLocation", ""); }}
            className={selectClass}
          >
            <option value="" disabled>{t.regSelectLocation}</option>
            {[...locations, ...(!locations.includes("Gwalior") ? ["Gwalior"] : [])].sort().map((l: string) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {isOtherLocation && (
            <input
              type="text"
              required
              placeholder={t.regCustomLocationPlaceholder}
              value={form.customLocation}
              onChange={(e) => update("customLocation", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
              className={`${inputClass} mt-2`}
              autoFocus
            />
          )}
        </Field>
        <Field label={t.regRate}>
          <input type="number" required min={0} placeholder="e.g. 15000" value={form.pricePerMonth} onChange={(e) => update("pricePerMonth", e.target.value)} className={inputClass} />
        </Field>
      </div>

      {/* Hours used + Availability */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.regHoursUsed}>
          <input type="number" required min={0} placeholder="e.g. 3400" value={form.hoursUsed} onChange={(e) => update("hoursUsed", e.target.value)} className={inputClass} />
        </Field>
        <div>
          <label className="mb-3 block text-sm font-semibold text-ink">{t.regAvailability}</label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => (
              <button key={val} type="button" onClick={() => { update("availability", val); if (val === "yes") update("availableFrom", ""); }}
                className={`rounded-full border px-6 py-2.5 text-sm font-semibold capitalize transition-colors ${form.availability === val ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:bg-mist"}`}>
                {val === "yes" ? t.regAvailableYes : t.regAvailableNo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {form.availability === "no" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-5">
          <label className="text-sm font-semibold text-ink">{t.regAvailableFromLabel}</label>
          <input type="date" required min={todayStr} value={form.availableFrom} onChange={(e) => update("availableFrom", e.target.value)} className={`${inputClass} max-w-xs text-center`} />
          {form.availableFrom && (
            <p className="text-sm text-neutral-500">
              {t.regAvailableFrom}{" "}
              <span className="font-semibold text-ink">
                {new Date(form.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Owner details */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t.regOwnerName}>
          <input type="text" required placeholder={t.regOwnerNamePlaceholder} value={form.ownerName} onChange={(e) => update("ownerName", e.target.value.replace(/[0-9]/g, ""))} className={inputClass} />
        </Field>
        <Field label={t.regContact}>
          <input type="tel" required maxLength={10} inputMode="numeric" placeholder={t.regContactPlaceholder} value={form.ownerContact} onChange={(e) => update("ownerContact", e.target.value.slice(0, 10))} className={inputClass} />
        </Field>
      </div>

      <Field label={t.regDescription}>
        <textarea rows={2} placeholder={t.regDescPlaceholder} value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} />
      </Field>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="w-full rounded-full bg-hivis px-6 py-4 text-base font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 sm:w-auto sm:px-12">
        {submitting ? t.regSubmitting : t.regSubmitBtn}
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
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  categories,
  craneTypes,
  companiesByCategory,
  companiesByCraneType,
  modelsByCategoryAndCompany,
  craneModelsByTypeAndCompany,
  statesAndCities,
  states,
} from "@/lib/machineOptions";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useAuth } from "@/context/AuthContext";

const categoryImageMap: { [key: string]: string } = {
  "Excavator": "/excavator.webp",
  "Concrete Pump": "/concrete.webp",
  "Fiori": "/fiori.webp",
  "JCB": "/jcb.webp",
  "Crane": "/crane.webp",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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

export default function RegisterForm() {
  const { lang } = useLang();
  const t = translations[lang];
  const { user, getAuthHeader } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    category: "",
    craneType: "",
    company: "",
    model: "",
    state: "",
    customState: "",
    location: "",
    customLocation: "",
    currentLocation: "",
    pricePerMonth: "",
    modelYear: "",
    hoursUsed: "",
    ownerName: user?.name ?? "",
    ownerContact: user?.phone ?? "",
    description: "",
    availability: "yes",
    availableFrom: "",
    operatorAvailable: "no",
    fuelIncluded: "no",
    transportAvailable: "no",
    transportCharges: "",
  });

  useEffect(() => {
    if (!user) return;
    const id = window.setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        ownerName: prev.ownerName || user.name,
        ownerContact: prev.ownerContact || user.phone,
      }));
    }, 0);
    return () => clearTimeout(id);
  }, [user]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isCrane = form.category === "Crane";
  const isOtherState = form.state === "Other";
  const isOtherLocation = form.location === "Other";
  const defaultImage = categoryImageMap[form.category] ?? "/excavator.webp";
  const todayStr = new Date().toISOString().split("T")[0];

  const availableCities = !isOtherState && form.state
    ? statesAndCities[form.state] ?? []
    : [];

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
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (files.length === 0) return;
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    setPreviewIndex(0);
  }

  const finalState = isOtherState ? form.customState.trim() : form.state;
  const finalCity = isOtherLocation ? form.customLocation.trim() : form.location;
  const finalLocation = [finalCity, finalState].filter(Boolean).join(", ");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/auth?redirect=/machinery/register");
      return;
    }
    if (isOtherState && !form.customState.trim()) {
      setError(t.regErrorState);
      return;
    }
    if (isOtherLocation && !form.customLocation.trim()) {
      setError(t.regErrorCity);
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      // Append all text fields
      const fields: Record<string, string | null> = {
        category: form.category,
        craneType: isCrane ? form.craneType : null,
        company: form.company,
        model: form.model,
        location: finalLocation,
        currentLocation: form.currentLocation.trim(),
        pricePerMonth: String(Number(form.pricePerMonth)),
        modelYear: String(Number(form.modelYear)),
        hoursUsed: String(Number(form.hoursUsed)),
        image: defaultImage,
        availability: form.availability,
        availableFrom: form.availability === "no" ? form.availableFrom : null,
        ownerName: form.ownerName,
        ownerContact: form.ownerContact,
        description: form.description,
        operatorAvailable: form.operatorAvailable,
        fuelIncluded: form.fuelIncluded,
        transportAvailable: form.transportAvailable,
        transportCharges: form.transportAvailable === "yes" && form.transportCharges ? form.transportCharges : null,
        ownerId: user._id,
      };

      for (const [key, value] of Object.entries(fields)) {
        if (value !== null && value !== undefined) formData.append(key, value);
      }

      // Append image files
      selectedFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(`${API_URL}/api/machines`, {
        method: "POST",
        headers: { ...getAuthHeader() }, // No Content-Type — browser sets it with boundary for FormData
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Something went wrong");
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
        <h3 className="mt-5 text-xl font-semibold text-ink">{t.regSuccessTitle}</h3>
        <p className="mt-2 text-neutral-600">{t.regSuccessSubtext}</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          Verified listing
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href="/machinery" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50">
            {t.regGoToListings}
          </a>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                category: "", craneType: "", company: "", model: "",
                state: "", customState: "", location: "", customLocation: "",
                currentLocation: "", pricePerMonth: "",
                modelYear: "", hoursUsed: "",
                ownerName: user?.name ?? "",
                ownerContact: user?.phone ?? "",
                description: "", availability: "yes", availableFrom: "",
                operatorAvailable: "no", fuelIncluded: "no",
                transportAvailable: "no", transportCharges: "",
              });
              setSelectedFiles([]);
              setPreviews([]);
              setPreviewIndex(0);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            {t.regListAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Photo upload */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">{t.regPhotoLabel}</label>
        <div className="flex items-start gap-5">
          {/* Preview */}
          <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <Image
              src={previews[previewIndex] ?? defaultImage}
              alt="Machine preview"
              fill
              className="object-cover"
              sizes="144px"
            />
            {previews.length === 0 && (
              <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white">
                {form.category ? `${form.category} (${t.regPhotoDefault})` : t.regPhotoDefault}
              </span>
            )}
            {/* Prev/Next arrows for multiple previews */}
            {previews.length > 1 && (
              <>
                <button type="button" onClick={() => setPreviewIndex((i) => (i - 1 + previews.length) % previews.length)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                </button>
                <button type="button" onClick={() => setPreviewIndex((i) => (i + 1) % previews.length)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                </button>
                <span className="absolute bottom-1 right-2 text-[10px] font-bold text-white drop-shadow">
                  {previewIndex + 1}/{previews.length}
                </span>
              </>
            )}
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-mist">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              {t.regPhotoBtn}
              <input type="file" accept="image/*" multiple onChange={handleImage} className="hidden" />
            </label>
            <p className="mt-2 text-xs text-neutral-400">Upload up to 4 photos. A default image is used if you skip this.</p>
            {previews.length > 0 && (
              <p className="mt-1 text-xs font-medium text-green-600">✓ {previews.length} photo{previews.length > 1 ? "s" : ""} selected</p>
            )}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <select required value={form.state} onChange={(e) => { update("state", e.target.value); update("location", ""); update("customLocation", ""); update("customState", ""); }} className={selectClass}>
              <option value="" disabled>{t.regSelectState}</option>
              {states.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>

            {isOtherState ? (
              <input type="text" required placeholder={t.regEnterStateName} value={form.customState} onChange={(e) => update("customState", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} className={inputClass} />
            ) : (
              <select required value={form.location} disabled={!form.state} onChange={(e) => { update("location", e.target.value); update("customLocation", ""); }} className={`${selectClass} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400`}>
                <option value="" disabled>{form.state ? t.regSelectLocation : t.regSelectStateFirst}</option>
                {availableCities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">{t.regOtherCityOption}</option>
              </select>
            )}
          </div>

          {!isOtherState && isOtherLocation && (
            <input type="text" required placeholder={t.regCustomLocationPlaceholder} value={form.customLocation} onChange={(e) => update("customLocation", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} className={`${inputClass} mt-3`} autoFocus />
          )}
          {isOtherState && (
            <input type="text" required placeholder={t.regCustomLocationPlaceholder} value={form.customLocation} onChange={(e) => update("customLocation", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} className={`${inputClass} mt-3`} />
          )}
        </Field>
        <Field label={t.regRate}>
          <input type="number" required min={0} placeholder="e.g. 15000" value={form.pricePerMonth} onChange={(e) => update("pricePerMonth", e.target.value)} className={inputClass} />
        </Field>
      </div>


      {/* Current location */}
      <Field label={t.regCurrentLocation}>
        <input type="text" placeholder={t.regCurrentLocationPlaceholder} value={form.currentLocation} onChange={(e) => update("currentLocation", e.target.value)} className={inputClass} />
        <p className="mt-1.5 text-xs text-neutral-400">{t.regCurrentLocationHint}</p>
      </Field>

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
          <div className="relative">
            <input type="tel" required value={form.ownerContact} readOnly className={`${inputClass} bg-neutral-50 cursor-not-allowed pr-20`} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">{t.regFromAccountVerified}</p>
        </Field>
      </div>

      {/* Operator / Fuel / Transport */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className="mb-3 block text-sm font-semibold text-ink">{t.regOperatorAvailable}</label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => (
              <button key={val} type="button"
                onClick={() => update("operatorAvailable", val)}
                className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${form.operatorAvailable === val ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:bg-mist"}`}>
                {val === "yes" ? t.regAvailableYes : t.regAvailableNo}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-3 block text-sm font-semibold text-ink">{t.regFuelIncluded}</label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => (
              <button key={val} type="button"
                onClick={() => update("fuelIncluded", val)}
                className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${form.fuelIncluded === val ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:bg-mist"}`}>
                {val === "yes" ? t.regAvailableYes : t.regAvailableNo}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-3 block text-sm font-semibold text-ink">{t.regTransportCharges}</label>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => (
              <button key={val} type="button"
                onClick={() => { update("transportAvailable", val); if (val === "no") update("transportCharges", ""); }}
                className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${form.transportAvailable === val ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:bg-mist"}`}>
                {val === "yes" ? t.regAvailableYes : t.regAvailableNo}
              </button>
            ))}
          </div>
          {form.transportAvailable === "yes" && (
            <input type="number" min={0} placeholder={t.regTransportPlaceholder} value={form.transportCharges} onChange={(e) => update("transportCharges", e.target.value)} className={`${inputClass} mt-3`} />
          )}
        </div>
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
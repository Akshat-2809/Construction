"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";

// ── PAGE ──────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink";

// ── GUIDE CARD ────────────────────────────────────────────────────────────────

function GuideCard({
  icon,
  title,
  steps,
  isOpen,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  steps: string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-2xl border bg-white transition-all duration-200 ${isOpen ? "border-ink shadow-md" : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-6 py-5 text-left">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isOpen ? "bg-ink text-hivis" : "bg-neutral-100 text-neutral-600"}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {icon}
          </svg>
        </div>
        <span className="flex-1 text-base font-semibold text-ink">{title}</span>
        <svg className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-neutral-100 px-6 pb-6 pt-5">
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hivis text-xs font-bold text-ink">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-neutral-600">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ── FAQ ITEM ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="text-sm font-semibold text-ink">{q}</span>
        <svg className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-neutral-500">{a}</p>}
    </div>
  );
}

// ── CONTACT FORM ──────────────────────────────────────────────────────────────

function ContactForm() {
  const { lang } = useLang();
  const t = translations[lang];
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return;
    setStatus("sending");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">{t.helpSentTitle}</h3>
        <p className="mt-2 text-sm text-neutral-500">{t.helpSentSubtext}</p>
        <button
          onClick={() => { setStatus("idle"); setForm({ name: "", phone: "", message: "" }); }}
          className="mt-5 rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-ink hover:bg-neutral-50"
        >
          {t.helpSendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">{t.helpNameLabel}</label>
          <input
            type="text"
            required
            placeholder={t.helpNamePlaceholder}
            value={form.name}
            onChange={(e) => update("name", e.target.value.replace(/[0-9]/g, ""))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">{t.helpPhoneLabel}</label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500">
              +91
            </span>
            <input
              type="tel"
              required
              placeholder="98765 43210"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              className={`${inputClass} rounded-l-none border-l-0`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">{t.helpMessageLabel}</label>
        <textarea
          required
          rows={4}
          placeholder={t.helpMessagePlaceholder}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{t.helpErrorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-hivis py-3.5 text-sm font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 sm:w-auto sm:px-10"
      >
        {status === "sending" ? t.helpSending : t.helpSendBtn}
      </button>
    </form>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const [openGuide, setOpenGuide] = useState<number | null>(0);

  const guides = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
      title: t.helpGuide1Title,
      steps: [
        t.helpGuide1Step1,
        t.helpGuide1Step2,
        t.helpGuide1Step3,
        t.helpGuide1Step4,
        t.helpGuide1Step5,
        t.helpGuide1Step6,
      ],
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
      title: t.helpGuide2Title,
      steps: [
        t.helpGuide2Step1,
        t.helpGuide2Step2,
        t.helpGuide2Step3,
        t.helpGuide2Step4,
        t.helpGuide2Step5,
        t.helpGuide2Step6,
      ],
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />,
      title: t.helpGuide3Title,
      steps: [
        t.helpGuide3Step1,
        t.helpGuide3Step2,
        t.helpGuide3Step3,
        t.helpGuide3Step4,
        t.helpGuide3Step5,
        t.helpGuide3Step6,
      ],
    },
  ];

  const faqs = [
    { q: t.helpFaq1Q, a: t.helpFaq1A },
    { q: t.helpFaq2Q, a: t.helpFaq2A },
    { q: t.helpFaq3Q, a: t.helpFaq3A },
    { q: t.helpFaq4Q, a: t.helpFaq4A },
    { q: t.helpFaq5Q, a: t.helpFaq5A },
    { q: t.helpFaq6Q, a: t.helpFaq6A },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="border-b border-neutral-100 bg-mist px-6 py-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-600">
          <span className="flex h-2 w-2 rounded-full bg-hivis" />
          {t.helpBadge}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {t.helpHeroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-neutral-500">
          {t.helpHeroSubtext}
        </p>

        {/* Quick jump buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {guides.map((g, i) => (
            <button
              key={i}
              onClick={() => {
                setOpenGuide(i);
                setTimeout(() => {
                  document.getElementById("guides")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-all hover:border-ink hover:shadow-sm"
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8">

        {/* Guides */}
        <section id="guides">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <svg className="h-4 w-4 text-hivis" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ink">{t.helpGuidesTitle}</h2>
          </div>

          <div className="space-y-3">
            {guides.map((guide, i) => (
              <GuideCard
                key={i}
                icon={guide.icon}
                title={guide.title}
                steps={guide.steps}
                isOpen={openGuide === i}
                onToggle={() => setOpenGuide(openGuide === i ? null : i)}
              />
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <svg className="h-4 w-4 text-hivis" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ink">{t.helpFaqTitle}</h2>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white px-6">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section className="mt-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <svg className="h-4 w-4 text-hivis" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-ink">{t.helpContactTitle}</h2>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <p className="mb-6 text-sm text-neutral-500">{t.helpContactSubtext}</p>
            <ContactForm />
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-mist px-6 py-10 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="font-semibold text-ink">{t.helpCtaTitle}</p>
            <p className="mt-1 text-sm text-neutral-500">{t.helpCtaSubtext}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/machinery"
              className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-white"
            >
              {t.helpCtaBrowse}
            </Link>
            <Link
              href="/machinery/register"
              className="rounded-full bg-hivis px-5 py-2.5 text-sm font-bold text-ink hover:bg-hivis-dark"
            >
              {t.helpCtaList}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
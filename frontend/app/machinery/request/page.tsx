"use client";

import RequestForm from "../../../components/machinery/requestForm";
import RequestBoard from "../../../components/machinery/requestCard";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";

export default function RequestPage() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">

        {/* Left — form */}
        <div>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-mist px-4 py-1.5 text-sm font-medium text-neutral-700">
              <span className="flex h-2 w-2 rounded-full bg-hivis" />
              {t.reqPageBadge}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t.reqPageTitle}
            </h1>
            <p className="mt-3 text-lg text-neutral-600">
              {t.reqPageSubtext}
            </p>
          </div>
          <RequestForm />
        </div>

        {/* Right — live request board */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink">{t.reqBoardTitle}</h2>
            <p className="mt-1 text-sm text-neutral-500">{t.reqBoardSubtext}</p>
          </div>
          <RequestBoard />
        </div>

      </div>
    </div>
  );
}
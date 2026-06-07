"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useAuth } from "@/context/AuthContext";

const icons = [
  <path key="1" strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
  <path key="2" strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
  <path key="3" strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />,
];

export default function HowItWorks() {
  const { lang } = useLang();
  const t = translations[lang];
  const { user } = useAuth();

  const steps = [
    { number: "01", title: t.step1Title, description: t.step1Desc, icon: icons[0] },
    { number: "02", title: t.step2Title, description: t.step2Desc, icon: icons[1] },
    { number: "03", title: t.step3Title, description: t.step3Desc, icon: icons[2] },
  ];

  const ctaHref = user ? "/machinery" : "/auth?redirect=/machinery";

  return (
    <section id="how-it-works" className="relative scroll-mt-20 bg-mist py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            {t.howEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t.howHeadline1}{" "}
            <span className="relative inline-block">
              {t.howHeadlineHighlight}
              <span className="absolute bottom-1 left-0 h-3 w-full bg-hivis/60" />
            </span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">{t.howSubtext}</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="absolute right-6 top-6 text-5xl font-bold text-neutral-100 transition-colors group-hover:text-hivis/30">
                {step.number}
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink text-hivis transition-transform duration-300 group-hover:scale-110">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  {step.icon}
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href={ctaHref}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-base font-semibold text-white transition-all hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0"
          >
            {t.howCta}
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
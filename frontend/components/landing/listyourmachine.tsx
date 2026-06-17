"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useAuth } from "@/context/AuthContext";

const icons = [
  <path key="1" strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  <path key="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.96 11.96 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />,
  <path key="3" strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />,
];

export default function ListYourMachine() {
  const { lang } = useLang();
  const t = translations[lang];
  const { user } = useAuth();

  const benefits = [
    { title: t.benefit1Title, description: t.benefit1Desc, icon: icons[0] },
    { title: t.benefit2Title, description: t.benefit2Desc, icon: icons[1] },
    { title: t.benefit3Title, description: t.benefit3Desc, icon: icons[2] },
  ];

  const listHref = user ? "/machinery/register" : "/auth?redirect=/machinery/register";

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-hivis/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              {t.listEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {t.listHeadline1}{" "}
              <span className="relative inline-block">
                {t.listHeadlineHighlight}
                <span className="absolute bottom-0 left-0 -z-10 h-[45%] w-full bg-hivis/70" />
              </span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">{t.listSubtext}</p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={listHref}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-hivis px-8 py-4 text-base font-bold text-ink transition-all hover:bg-hivis-dark hover:-translate-y-0.5 active:translate-y-0"
              >
                {t.listCta1}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-8 py-4 text-base font-semibold text-ink transition-all hover:border-neutral-400 hover:bg-mist"
              >
                {t.listCta2}
              </Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
              <svg className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {t.listReassurance}
            </p>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="group flex gap-5 rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-hivis transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    {benefit.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{benefit.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-neutral-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
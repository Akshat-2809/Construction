"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";

function TranslateButton({ className }: { className?: string }) {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:text-ink ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
      </svg>
      {lang === "en" ? "हिंदी" : "English"}
    </button>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang } = useLang();
  const t = translations[lang];

  // Inside component so it re-renders when lang changes
  const navLinks = [
    { label: t.navHowItWorks, href: "/#how-it-works" },
    { label: t.navNeedMachine, href: "/machinery/request" },
    { label: t.navListMachine, href: "/machinery/register" },
    { label: t.navBrowse, href: "/machinery" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white/85 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-neutral-200 shadow-sm" : "border-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 lg:px-8 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-base font-bold text-hivis transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            A
          </span>
          <span className="text-xl font-semibold tracking-tight text-ink">
            ACE
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-neutral-600 transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-hivis transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <TranslateButton />
          <Link
            href="/machinery"
            className="rounded-full bg-hivis px-6 py-2.5 text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:bg-hivis-dark hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            {t.navFindMachines}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-neutral-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Toggle menu</span>
          <span className="relative block h-4 w-6">
            <span className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 block h-0.5 w-6 bg-current transition-all duration-200 ${isOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-neutral-200/80 bg-white transition-all duration-300 ease-out md:hidden ${
          isOpen ? "max-h-[500px] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 px-6 py-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: isOpen ? `${i * 60 + 80}ms` : "0ms" }}
              className={`block rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-all duration-300 hover:bg-mist hover:text-ink ${
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Translate — mobile */}
          <div
            style={{ transitionDelay: isOpen ? `${navLinks.length * 60 + 80}ms` : "0ms" }}
            className={`transition-all duration-300 ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
          >
            <TranslateButton className="w-full justify-center rounded-lg py-3 text-base" />
          </div>

          <Link
            href="/machinery"
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? `${(navLinks.length + 1) * 60 + 80}ms` : "0ms" }}
            className={`mt-3 block rounded-full bg-hivis px-3 py-3 text-center text-base font-bold text-ink transition-all duration-300 hover:bg-hivis-dark ${
              isOpen ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
            }`}
          >
            {t.navFindMachines}
          </Link>
        </div>
      </div>
    </header>
  );
}
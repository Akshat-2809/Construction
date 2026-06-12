"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useAuth } from "@/context/AuthContext";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { lang } = useLang();
  const t = translations[lang];
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const navLinks = [
    { label: t.navHowItWorks, href: "/#how-it-works", protected: false },
    { label: t.navNeedMachine, href: "/machinery/request", protected: true },
    { label: t.navListMachine, href: "/machinery/register", protected: true },
    { label: t.navBrowse, href: "/machinery", protected: true },
  ];

  function resolveHref(href: string, isProtected: boolean): string {
    if (isProtected && !user) {
      return `/auth?redirect=${encodeURIComponent(href)}`;
    }
    return href;
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  const findMachinesHref = user ? "/machinery" : "/auth?redirect=/machinery";

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
          <span className="text-xl font-semibold tracking-tight text-ink">ACE</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href, link.protected)}
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

          {!loading && (
            user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-hivis">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name.split(" ")[0]}
                  <svg className={`h-4 w-4 text-neutral-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                    <div className="border-b border-neutral-100 px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="text-xs text-neutral-400">{user.phone}</p>
                    </div>

                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/my-listings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      My listings
                    </Link>
                    <Link
                      href="/machinery/register"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      List a machine
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50"
              >
                Log in
              </Link>
            )
          )}

          <Link
            href={findMachinesHref}
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
          isOpen ? "max-h-[600px] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 px-6 py-4">

          {/* Logged-in user info on mobile */}
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-hivis">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-xs text-neutral-400">{user.phone}</p>
              </div>
            </div>
          )}

          {/* Admin Dashboard — mobile */}
          {user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-mist hover:text-ink"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
              </svg>
              Admin Dashboard
            </Link>
          )}

          {/* My listings — mobile */}
          {user && (
            <Link
              href="/my-listings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-mist hover:text-ink"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              My listings
            </Link>
          )}

          {/* Nav links */}
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={resolveHref(link.href, link.protected)}
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

          {/* Login / Logout — mobile */}
          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                style={{ transitionDelay: isOpen ? `${(navLinks.length + 1) * 60 + 80}ms` : "0ms" }}
                className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-red-500 transition-all duration-300 hover:bg-red-50 ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Log out
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: isOpen ? `${(navLinks.length + 1) * 60 + 80}ms` : "0ms" }}
                className={`mt-1 block rounded-lg px-3 py-3 text-base font-medium text-ink transition-all duration-300 hover:bg-mist ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}
              >
                Log in / Register
              </Link>
            )
          )}

          <Link
            href={findMachinesHref}
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? `${(navLinks.length + 2) * 60 + 80}ms` : "0ms" }}
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
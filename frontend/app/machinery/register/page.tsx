"use client";

import RegisterForm from "@/components/machinery/registerForm";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function RegisterPage() {
  const { user, loading } = useRequireAuth();
  const { lang } = useLang();
  const t = translations[lang];

  if (loading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-ink" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t.regPageTitle}
        </h1>
        <p className="mt-3 text-lg text-neutral-600">
          {t.regPageSubtext}
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
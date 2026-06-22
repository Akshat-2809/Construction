"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { translations } from "@/lib/translation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/requests`;

interface MachineRequest {
  _id: string;
  category: string;
  craneType?: string;
  location: string;
  requiredFrom: string;
  requiredTill?: string;
  budgetPerMonth?: number;
  description?: string;
  contactName: string;
  contactNumber: string;
  createdAt: string;
}

const categoryColors: { [key: string]: string } = {
  Excavator: "bg-amber-50 text-amber-700 border-amber-200",
  "Concrete Pump": "bg-blue-50 text-blue-700 border-blue-200",
  Fiori: "bg-yellow-50 text-yellow-700 border-yellow-200",
  JCB: "bg-orange-50 text-orange-700 border-orange-200",
  Crane: "bg-purple-50 text-purple-700 border-purple-200",
  Any: "bg-neutral-50 text-neutral-700 border-neutral-200",
};

export default function RequestBoard() {
  const { lang } = useLang();
  const t = translations[lang];

  const [requests, setRequests] = useState<MachineRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to load requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex gap-3">
              <div className="h-6 w-24 rounded-full bg-neutral-200" />
              <div className="h-6 w-16 rounded-full bg-neutral-100" />
            </div>
            <div className="mt-3 h-4 w-1/2 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-2/3 rounded bg-neutral-100" />
            <div className="mt-4 h-10 w-full rounded-full bg-neutral-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-500">
        {t.reqCardError}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
        <svg className="mx-auto h-8 w-8 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        {t.reqCardEmpty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const postedAgo = getTimeAgo(req.createdAt, t.reqCardJustNow);
        const fromDate = new Date(req.requiredFrom).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        });
        const tillDate = req.requiredTill
          ? new Date(req.requiredTill).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })
          : null;
        const colorClass = categoryColors[req.category] ?? categoryColors["Any"];

        return (
          <div key={req._id} className="rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${colorClass}`}>
                {req.craneType ? `${req.craneType} Crane` : req.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {req.location}
              </span>
              <span className="ml-auto text-xs text-neutral-400">{postedAgo}</span>
            </div>

            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {tillDate ? `${fromDate} → ${tillDate}` : `${t.reqCardFrom} ${fromDate}`}
              </div>
              {req.budgetPerMonth && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {t.reqCardBudget}: ₹{req.budgetPerMonth.toLocaleString("en-IN")}/month
                </div>
              )}
            </div>

            {req.description && (
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-500 line-clamp-2">
                {req.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                {req.contactName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{req.contactName}</p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <a
                  href={`tel:${req.contactNumber.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 rounded-full bg-hivis px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-hivis-dark"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  {t.reqCardCall}
                </a>
                <a
                  href={`https://wa.me/91${req.contactNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hi ${req.contactName}, I saw your request on Myequipo for a ${req.craneType ? `${req.craneType} Crane` : req.category} in ${req.location} (${fromDate}${tillDate ? ` → ${tillDate}` : ""}). I have a machine available — can we connect?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1fbb57]"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.21 0 4.29.86 5.85 2.42a8.23 8.23 0 0 1 2.43 5.83c0 4.55-3.71 8.25-8.27 8.25a8.27 8.27 0 0 1-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.27-4.4c0-4.55 3.71-8.24 8.26-8.24Zm-4.57 4.7c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.13.17 1.74 2.78 4.32 3.83 2.14.87 2.57.7 3.04.65.46-.04 1.49-.6 1.7-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.57.13-.17.25-.65.82-.8 1-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.66-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.39-.79-1.9-.2-.49-.41-.43-.57-.44-.15-.01-.32-.01-.49-.01Z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(dateStr: string, justNowText: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return justNowText;
}
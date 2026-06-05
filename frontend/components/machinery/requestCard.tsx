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
              <a
                href={`tel:${req.contactNumber.replace(/\s/g, "")}`}
                className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-hivis px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-hivis-dark"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                {t.reqCardCall}
              </a>
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
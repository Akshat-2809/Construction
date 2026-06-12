"use client";

import { useState, useEffect } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Machine } from "@/types/machine";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface Stats {
  totals: { users: number; machines: number; requests: number };
  thisWeek: { users: number; machines: number; requests: number };
  machinesByCategory: { name: string; count: number }[];
  machinesByLocation: { name: string; count: number }[];
  requestsByCategory: { name: string; count: number }[];
}

interface AdminUser {
  _id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  listingCount: number;
}

interface RequestItem {
  _id: string;
  category: string;
  location: string;
  contactName: string;
  contactNumber: string;
  requiredFrom: string;
  createdAt: string;
}

const COLORS = ["#FFD000", "#1A1A1A", "#737373", "#A3A3A3", "#D4D4D4"];

type Tab = "overview" | "users" | "machines" | "requests";

export default function AdminPage() {
  const { user, loading: authLoading } = useRequireAdmin();
  const [tab, setTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadAll() {
      try {
        const [statsRes, usersRes, machinesRes, requestsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { credentials: "include" }),
          fetch(`${API_URL}/api/admin/users`, { credentials: "include" }),
          fetch(`${API_URL}/api/admin/machines`, { credentials: "include" }),
          fetch(`${API_URL}/api/admin/requests`, { credentials: "include" }),
        ]);

        if (!statsRes.ok || !usersRes.ok || !machinesRes.ok || !requestsRes.ok) {
          throw new Error("Failed to load admin data");
        }

        const [statsData, usersData, machinesData, requestsData] = await Promise.all([
          statsRes.json(), usersRes.json(), machinesRes.json(), requestsRes.json(),
        ]);

        if (!cancelled) {
          setStats(statsData);
          setUsers(usersData);
          setMachines(machinesData);
          setRequests(requestsData);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [user]);

  async function deleteMachine(id: string) {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/machines/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMachines((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm("Delete this request?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-ink" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: `Users (${users.length})` },
    { id: "machines", label: `Machines (${machines.length})` },
    { id: "requests", label: `Requests (${requests.length})` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-neutral-500">Live overview of ACE platform data</p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-ink" />
        </div>
      )}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
          <p className="font-semibold text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-8">

              {/* Stat cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Users" value={stats.totals.users} sub={`+${stats.thisWeek.users} this week`} />
                <StatCard label="Total Machines" value={stats.totals.machines} sub={`+${stats.thisWeek.machines} this week`} />
                <StatCard label="Total Requests" value={stats.totals.requests} sub={`+${stats.thisWeek.requests} this week`} />
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">

                {/* Machines by category — pie */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Machines by Category</h3>
                  {stats.machinesByCategory.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={stats.machinesByCategory}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, value }) => `${name} (${value})`}
                        >
                          {stats.machinesByCategory.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Machines by location — bar */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Machines by Location</h3>
                  {stats.machinesByLocation.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stats.machinesByLocation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#FFD000" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Requests by category — bar */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Requests by Category</h3>
                  {stats.requestsByCategory.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stats.requestsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Requests" fill="#1A1A1A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-500">
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">Listings</th>
                      <th className="px-5 py-3 font-semibold">Joined</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-neutral-400">No users yet</td></tr>
                    ) : users.map((u) => (
                      <tr key={u._id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                        <td className="px-5 py-3 text-neutral-600">{u.phone}</td>
                        <td className="px-5 py-3 text-neutral-600">{u.listingCount}</td>
                        <td className="px-5 py-3 text-neutral-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
                          {u.isAdmin ? (
                            <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">Admin</span>
                          ) : (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">User</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MACHINES ── */}
          {tab === "machines" && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-500">
                      <th className="px-5 py-3 font-semibold">Machine</th>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Location</th>
                      <th className="px-5 py-3 font-semibold">Rate/mo</th>
                      <th className="px-5 py-3 font-semibold">Owner</th>
                      <th className="px-5 py-3 font-semibold">Listed</th>
                      <th className="px-5 py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-neutral-400">No machines yet</td></tr>
                    ) : machines.map((m) => (
                      <tr key={m._id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{m.company} {m.model}</td>
                        <td className="px-5 py-3 text-neutral-600">{m.category}</td>
                        <td className="px-5 py-3 text-neutral-600">{m.location}</td>
                        <td className="px-5 py-3 text-neutral-600">₹{m.pricePerMonth?.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3 text-neutral-600">{m.ownerName}</td>
                        <td className="px-5 py-3 text-neutral-500">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => deleteMachine(m._id!)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REQUESTS ── */}
          {tab === "requests" && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-neutral-500">
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Location</th>
                      <th className="px-5 py-3 font-semibold">Contact</th>
                      <th className="px-5 py-3 font-semibold">Required From</th>
                      <th className="px-5 py-3 font-semibold">Posted</th>
                      <th className="px-5 py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-neutral-400">No requests yet</td></tr>
                    ) : requests.map((r) => (
                      <tr key={r._id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{r.category}</td>
                        <td className="px-5 py-3 text-neutral-600">{r.location}</td>
                        <td className="px-5 py-3 text-neutral-600">{r.contactName} · {r.contactNumber}</td>
                        <td className="px-5 py-3 text-neutral-500">
                          {new Date(r.requiredFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3 text-neutral-500">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => deleteRequest(r._id)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-green-600">{sub}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-neutral-400">
      No data yet
    </div>
  );
}
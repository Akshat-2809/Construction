
"use client";

import { useState, useEffect } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useAuth } from "@/context/AuthContext";
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
  const { getAuthHeader } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadAll() {
      try {
        const headers = { ...getAuthHeader() };

        const [statsRes, usersRes, machinesRes, requestsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { headers }),
          fetch(`${API_URL}/api/admin/users`, { headers }),
          fetch(`${API_URL}/api/admin/machines`, { headers }),
          fetch(`${API_URL}/api/admin/requests`, { headers }),
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
  }, [user]); // ✅ removed getAuthHeader — now stable via useCallback, no need in deps

  async function deleteMachine(id: string) {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/machines/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
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
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function confirmDeleteUser() {
    if (!deleteUserTarget) return;
    setDeletingUser(true);
    setDeleteUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${deleteUserTarget._id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserTarget._id));
      setMachines((prev) => prev.filter((m) => m.ownerId !== deleteUserTarget._id));
      setDeleteUserTarget(null);
    } catch (err) {
      setDeleteUserError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUser(false);
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-neutral-500">Live overview of Myequipo platform data</p>
      </div>

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

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Users" value={stats.totals.users} sub={`+${stats.thisWeek.users} this week`} />
                <StatCard label="Total Machines" value={stats.totals.machines} sub={`+${stats.thisWeek.machines} this week`} />
                <StatCard label="Total Requests" value={stats.totals.requests} sub={`+${stats.thisWeek.requests} this week`} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Machines by Category</h3>
                  {stats.machinesByCategory.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={stats.machinesByCategory} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                          {stats.machinesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Machines by Location</h3>
                  {stats.machinesByLocation.length === 0 ? <EmptyChart /> : (
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

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Requests by Category</h3>
                  {stats.requestsByCategory.length === 0 ? <EmptyChart /> : (
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

          {/* USERS */}
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
                      <th className="px-5 py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-neutral-400">No users yet</td></tr>
                    ) : users.map((u) => {
                      const isSelf = u._id === user._id;
                      return (
                        <tr key={u._id} className="border-b border-neutral-50 last:border-0">
                          <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                          <td className="px-5 py-3 text-neutral-600">{u.phone}</td>
                          <td className="px-5 py-3 text-neutral-600">{u.listingCount}</td>
                          <td className="px-5 py-3 text-neutral-500">
                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3">
                            {u.isAdmin
                              ? <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">Admin</span>
                              : <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">User</span>}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {isSelf ? (
                              <span className="text-xs text-neutral-400" title="Use 'Delete my account' from your profile menu">You</span>
                            ) : (
                              <button
                                onClick={() => { setDeleteUserError(""); setDeleteUserTarget(u); }}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MACHINES */}
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
                          <button onClick={() => deleteMachine(m._id!)} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">
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

          {/* REQUESTS */}
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
                          <button onClick={() => deleteRequest(r._id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">
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

      {/* DELETE USER MODAL */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">Delete this user?</h3>
            <p className="mt-2 text-sm text-neutral-500">
              This will permanently delete <span className="font-semibold text-ink">{deleteUserTarget.name}</span> ({deleteUserTarget.phone}),
              along with <span className="font-semibold text-ink">{deleteUserTarget.listingCount}</span> machine listing(s) and any requests they posted.
              {" "}<span className="font-semibold text-red-600">This cannot be undone.</span>
            </p>

            {deleteUserError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{deleteUserError}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteUserTarget(null)}
                disabled={deletingUser}
                className="flex-1 rounded-full border border-neutral-200 py-3 text-sm font-semibold text-ink hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deletingUser}
                className="flex-1 rounded-full bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingUser ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
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

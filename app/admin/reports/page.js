// app/admin/reports/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken") || localStorage.getItem("token")
          : null;

      const params =
        statusFilter === "all" ? "" : `?status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(`${API_BASE}/api/reports${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };


  const replyToReport = async (id) => {
    const reply = prompt("Reply to this user:");
    if (!reply || !reply.trim()) return;

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken") || localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_BASE}/api/reports/${id}/reply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reply }),
      });

      if (!res.ok) throw new Error("Failed");
      await loadReports();
    } catch (e) {
      console.error(e);
      alert("Failed to send reply");
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken") || localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_BASE}/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed");

      await loadReports();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const deleteReport = async (id) => {
    if (!confirm("Delete this report?")) return;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken") || localStorage.getItem("token")
          : null;

      const res = await fetch(`${API_BASE}/api/reports/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed");

      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete report");
    }
  };

  // 🔹 status-based colors
  const cardStatusClasses = (status) => {
    switch (status) {
      case "fixed":
        return "border-green-500/70 bg-green-900/20";
      case "unfixable":
        return "border-red-500/70 bg-red-900/20";
      case "seen":
        return "border-blue-500/60 bg-blue-900/10";
      case "new":
      default:
        return "border-yellow-500/60 bg-yellow-900/10";
    }
  };

  const statusBadgeClasses = (status) => {
    switch (status) {
      case "fixed":
        return "bg-green-600/20 text-green-400 border border-green-500/60";
      case "unfixable":
        return "bg-red-600/20 text-red-400 border border-red-500/60";
      case "seen":
        return "bg-blue-600/20 text-blue-300 border border-blue-500/60";
      case "new":
      default:
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/60";
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white">
      <h1 className="mb-4 text-2xl font-semibold">Reported Problems</h1>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-zinc-300">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md bg-zinc-900 px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="seen">Seen</option>
          <option value="fixed">Fixed</option>
          <option value="unfixable">Unfixable</option>
        </select>
        <button
          onClick={loadReports}
          className="rounded-md bg-zinc-800 px-3 py-1 text-sm"
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading reports…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && reports.length === 0 && (
        <p className="text-sm text-zinc-400">No reports.</p>
      )}

      <div className="mt-2 space-y-3">
        {reports.map((r) => (
          <div
            key={r._id}
            className={
              "rounded-md border p-3 text-sm " + cardStatusClasses(r.status)
            }
          >
            <div className="flex justify-between gap-3">
              <div>
                  <div 
                    className="font-semibold">
                    Movie: {r.movie?.title || r.movieTitle || "N/A"}
                  </div>

                  {r.movie?.tmdbId && (
                    <div className="text-xs text-zinc-300">
                      TMDB ID: {r.movie.tmdbId}
                      {/* optional: quick TMDB link */}
                      {/* 
                      <a
                        href={`https://www.themoviedb.org/search?query=${r.movie.tmdbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 text-blue-400 underline"
                      >
                        (open TMDB)
                      </a>
                      */}
                    </div>
                  )}

                  <div>User: {r.user?.email || r.user?.name || r.user?._id}</div>
                  <div>Problem: {r.problemType}</div>
                  {r.message && (
                    <div className="mt-1 text-zinc-300">Note: {r.message}</div>
                  )}
                    {r.adminReply && (
                  <div className="mt-1 text-xs text-green-300">
                    Admin reply: {r.adminReply}
                    {r.repliedAt && (
                      <span className="ml-2 text-[10px] text-zinc-500">
                        ({new Date(r.repliedAt).toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-300">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] " +
                        statusBadgeClasses(r.status)
                      }
                    >
                      {r.status}
                    </span>
                    <span className="text-zinc-500">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "unknown"}
                    </span>
                  </div>
                </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => updateStatus(r._id, "seen")}
                  className="rounded bg-blue-700 px-2 py-1 text-xs"
                >
                  Mark as seen
                </button>
                <button
                  onClick={() => updateStatus(r._id, "fixed")}
                  className="rounded bg-green-700 px-2 py-1 text-xs"
                >
                  Mark as fixed
                </button>
                <button
                  onClick={() => updateStatus(r._id, "unfixable")}
                  className="rounded bg-yellow-700 px-2 py-1 text-xs"
                >
                  Mark unfixable
                </button>
                <button
                  onClick={() => replyToReport(r._id)}
                  className="rounded bg-purple-700 px-2 py-1 text-xs"
                >
                  Reply
                </button>
                <button
                  onClick={() => deleteReport(r._id)}
                  className="rounded bg-red-700 px-2 py-1 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

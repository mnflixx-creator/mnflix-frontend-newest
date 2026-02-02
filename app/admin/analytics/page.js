"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ filters
  const [range, setRange] = useState("7d"); // "7d" | "30d" | "all"
  const [moviesRange, setMoviesRange] = useState("all"); // "week" | "month" | "all"

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, [range]);

  // ✅ helpers
  const formatMoney = (n) =>
    new Intl.NumberFormat("mn-MN").format(Number(n || 0)) + "₮";

  const fmtShortDate = (d) => {
    if (!d) return "";
    // Accept "YYYY-MM-DD" or ISO
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  const sliceByRange = (arr) => {
    if (!Array.isArray(arr)) return [];
    if (range === "all") return arr;
    const n = range === "30d" ? 30 : 7;
    return arr.slice(-n);
  };

  // ✅ ALWAYS compute memo values before returns (Hooks rule)
  const usersTotal = stats?.users || 0;
  const subscribed = stats?.subscribed || 0;
  const moviesTotal = stats?.movies || 0;
  const unsubscribed = Math.max(usersTotal - subscribed, 0);

  // Expecting backend arrays like:
  // stats.registrationsDaily: [{ date, count }]
  // stats.subscriptionsDaily: [{ date, count, revenue, basicRevenue?, premiumRevenue? }]
  const registrationsDaily = useMemo(() => {
    const arr = Array.isArray(stats?.registrationsDaily)
      ? stats.registrationsDaily
      : [];

    return sliceByRange(arr).map((x) => ({
      date: fmtShortDate(x._id), // ✅ FIX HERE
      value: Number(x.count || 0),
    }));
  }, [stats, range]);

  const subscriptionsDaily = useMemo(() => {
    const arr = Array.isArray(stats?.subscriptionsDaily)
      ? stats.subscriptionsDaily
      : [];

    return sliceByRange(arr).map((x) => ({
      date: fmtShortDate(x._id), // ✅ FIX HERE
      subs: Number(x.count || 0),
      revenue: Number(x.revenue || 0),
      basicRevenue: Number(x.basicRevenue || 0),
      premiumRevenue: Number(x.premiumRevenue || 0),
    }));
  }, [stats, range]);

  const revenueDailyTotal = useMemo(() => {
    return (subscriptionsDaily || []).reduce(
      (s, x) => s + Number(x.revenue || 0),
      0
    );
  }, [subscriptionsDaily]);

  // ✅ Movies sets (backend optional)
  const topMoviesAll = Array.isArray(stats?.topMovies) ? stats.topMovies : [];
  const topMoviesWeekly = Array.isArray(stats?.topMoviesWeekly)
    ? stats.topMoviesWeekly
    : [];
  const topMoviesMonthly = Array.isArray(stats?.topMoviesMonthly)
    ? stats.topMoviesMonthly
    : [];

  const moviesList = useMemo(() => {
    if (moviesRange === "week" && topMoviesWeekly.length) return topMoviesWeekly;
    if (moviesRange === "month" && topMoviesMonthly.length)
      return topMoviesMonthly;
    return topMoviesAll;
  }, [moviesRange, topMoviesAll, topMoviesWeekly, topMoviesMonthly]);

  // ✅ STOP here only for conditional returns (hooks already declared)
  if (loading) return <p className="text-gray-300">Loading analytics…</p>;
  if (!stats) return <p className="text-red-400">Failed to load analytics.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "7d", label: "Last 7 days" },
          { key: "30d", label: "Last 30 days" },
          { key: "all", label: "All" },
        ].map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={[
              "px-4 py-2 rounded-xl font-bold border transition",
              range === r.key
                ? "bg-[#2EA8FF] text-black border-white/10"
                : "bg-black/40 text-white border-white/10 hover:bg-white/5",
            ].join(" ")}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">Total users</div>
          <div className="text-2xl font-extrabold">{usersTotal}</div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">Active subscribers</div>
          <div className="text-2xl font-extrabold">{subscribed}</div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">Inactive users</div>
          <div className="text-2xl font-extrabold">{unsubscribed}</div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">Movies</div>
          <div className="text-2xl font-extrabold">{moviesTotal}</div>
        </div>
      </div>

      {/* CHARTS: Registrations + Subscriptions + Revenue */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Registrations */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Daily registrations</h2>
            <span className="text-white/60 text-sm">{range}</span>
          </div>

          {registrationsDaily.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="h-56 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationsDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Subscriptions */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Daily subscriptions</h2>
            <span className="text-white/60 text-sm">{range}</span>
          </div>

          {subscriptionsDaily.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subscriptionsDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="subs" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Revenue + per plan revenue (if backend provides basicRevenue/premiumRevenue) */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">Revenue total ({range})</div>
          <div className="text-2xl font-extrabold">
            {formatMoney(revenueDailyTotal)}
          </div>

          <div className="mt-4">
            {subscriptionsDaily.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={subscriptionsDaily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Revenue by plan</h2>
            <span className="text-white/60 text-sm">
              (works only if backend sends basicRevenue/premiumRevenue)
            </span>
          </div>

          {subscriptionsDaily.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subscriptionsDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="basicRevenue" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="premiumRevenue" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* MOVIES */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">Top watched movies</h2>

          <div className="flex gap-2">
            {[
              { key: "week", label: "Weekly" },
              { key: "month", label: "Monthly" },
              { key: "all", label: "All time" },
            ].map((x) => (
              <button
                key={x.key}
                onClick={() => setMoviesRange(x.key)}
                className={[
                  "px-3 py-2 rounded-xl font-bold border transition",
                  moviesRange === x.key
                    ? "bg-[#2EA8FF] text-black border-white/10"
                    : "bg-black/40 text-white border-white/10 hover:bg-white/5",
                ].join(" ")}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        {moviesList.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No watch data yet (or your backend doesn’t provide this range).
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {moviesList.map((m) => (
              <div
                key={m._id}
                className="bg-white/5 rounded-lg overflow-hidden border border-white/10"
              >
                {m.thumbnail && (
                  <img
                    src={
                      m.thumbnail.startsWith("http")
                        ? m.thumbnail
                        : `${process.env.NEXT_PUBLIC_API_URL}${m.thumbnail}`
                    }
                    className="w-full h-32 object-cover"
                    alt={m.title}
                  />
                )}

                <div className="p-3">
                  <p className="text-sm font-semibold mb-1">{m.title}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    {m.views || 0} views
                  </p>

                  <div className="w-full bg-white/10 h-2 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#2EA8FF]"
                      style={{ width: `${m.percent || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

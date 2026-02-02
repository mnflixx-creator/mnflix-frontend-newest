"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");   // ⭐ NEW

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Admin token not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          // 429 → plain text like "Too many requests"
          const text = await res.text().catch(() => "");
          console.error("admin/stats error", res.status, text);
          setError(
            text
              ? `Backend error ${res.status}: ${text}`
              : `Backend error ${res.status}`
          );
          return null; // ❗ don't try to parse JSON
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => {
        console.error("admin/stats fetch failed", err);
        setError("Failed to load dashboard stats.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-300">Loading dashboard…</p>;

  // ⭐ If backend returned 429 or any error, show message instead of crashing
  if (error || !stats) {
    return (
      <div className="text-sm text-red-400">
        {error || "No stats available right now. Please try again later."}
      </div>
    );
  }

  const subscriptionChart = [
    { name: "Subscribed", value: stats.subscribed },
    { name: "Not Subscribed", value: stats.users - stats.subscribed },
  ];

  const COLORS = ["#2EA8FF", "#888888"];

  return (
    <div className="space-y-10 text-white">
      {/* TOP STATS */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.users} />
        <StatCard title="Active Subscribers" value={stats.subscribed} />
        <StatCard title="Total Movies" value={stats.movies} />
      </div>

      {/* SUBSCRIPTION PIE CHART */}
      <div className="bg-black/40 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">Subscription Overview</h2>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={subscriptionChart}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label
              >
                {subscriptionChart.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP WATCHED MOVIES */}
      <div className="bg-black/40 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">Top 10 Watched Movies</h2>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart data={stats.topMovies}>
              <XAxis dataKey="title" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#2EA8FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Thumbnails strip */}
        <div className="flex overflow-x-auto gap-4 mt-4 no-scrollbar">
          {stats.topMovies.map((m) => (
            <div key={m._id} className="text-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${m.thumbnail}`}
                className="w-24 h-36 object-cover rounded-xl"
              />
              <p className="text-xs mt-1">{m.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-black/40 p-6 rounded-xl border border-white/10">
      <h3 className="text-gray-300 text-sm">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

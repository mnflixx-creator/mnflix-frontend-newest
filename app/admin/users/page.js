"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminUsersPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
  if (!API_BASE) {
    console.error("Missing NEXT_PUBLIC_API_URL");
  }

  const ADMIN_SUB_BASE = `${API_BASE}/api/subscription/admin`;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState({}); // { [userId]: true/false }
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // which user has month menu open
  const [monthMenuFor, setMonthMenuFor] = useState(null); // userId | null

  // DELETE route (if you implemented it)
  const makeDeleteUrl = (id) => `${API_BASE}/api/admin/users/${id}`;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    fetch(`${ADMIN_SUB_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [ADMIN_SUB_BASE]);

  const fmt = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("en-US");
  };

  const getLatestSub = (u) => {
    const arr = Array.isArray(u.subscriptionHistory)
      ? u.subscriptionHistory
      : [];
    return arr.length ? arr[arr.length - 1] : null;
  };

  const extractCodeFromNote = (note) => {
    if (!note || typeof note !== "string") return null;
    const m = note.match(/code=([A-Z0-9]+)/i);
    return m?.[1]?.toUpperCase() || null;
  };

  const normalizedUsers = useMemo(() => {
    return users.map((u) => {
      const latest = getLatestSub(u);

      const subscribedAt =
        u.subscribedAt ||
        u.subscriptionStartedAt ||
        latest?.startAt ||
        null;
      const endsAt =
        u.endsAt || u.subscriptionExpiresAt || latest?.endAt || null;

      const transferCode =
        u.transferCode || extractCodeFromNote(latest?.note) || "—";

      return {
        ...u,
        _subscribedAt: subscribedAt,
        _endsAt: endsAt,
        _transferCode: transferCode,
      };
    });
  }, [users]);

  // whenever list / search / sort changes → go back to page 1
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, users.length]);

  const safeJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();

    if (!ct.includes("application/json")) {
      throw new Error(
        `Server did not return JSON.\nStatus: ${res.status}\n${text.slice(
          0,
          200
        )}`
      );
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid JSON.\nStatus: ${res.status}\n${text.slice(0, 200)}`
      );
    }
  };

  // core: call backend to set subscription
  const handleSetSubscription = async (user, { active, months }) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return alert("No adminToken found. Please login again.");

    setActionLoading((p) => ({ ...p, [user._id]: true }));

    try {
      const body = {
        userId: user._id,
        active,            // true = activate/extend, false = deactivate
        plan: "basic",     // or "premium" if you add that later
      };

      // only send months when activating
      if (active) {
        body.months = months || 1;
      }

      const res = await fetch(`${ADMIN_SUB_BASE}/set-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        alert(data?.message || "Failed to update subscription");
        return;
      }

      const updatedUser = data.user || data;

      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      // close month menu after success
      setMonthMenuFor(null);
    } catch (err) {
      alert(err.message || "Request failed");
    } finally {
      setActionLoading((p) => ({ ...p, [user._id]: false }));
    }
  };

  // When button is clicked
  const onActivateClick = (user) => {
    const isActive = user.subscriptionStatus === "active";

    // if active → just deactivate directly
    if (isActive) {
      return handleSetSubscription(user, { active: false });
    }

    // if inactive → toggle month menu
    setMonthMenuFor((prev) => (prev === user._id ? null : user._id));
  };

  // when choosing months option
  const onSelectMonths = (user, months) => {
    handleSetSubscription(user, { active: true, months });
  };

  const deleteUser = async (user) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return alert("No adminToken found. Please login again.");

    const ok = confirm(`Delete user?\n${user.email || user._id}`);
    if (!ok) return;

    setActionLoading((p) => ({ ...p, [user._id]: true }));

    try {
      const res = await fetch(makeDeleteUrl(user._id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        alert(data?.message || "Delete failed");
        return;
      }

      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      alert(err.message || "Delete request failed");
    } finally {
      setActionLoading((p) => ({ ...p, [user._id]: false }));
    }
  };

  if (loading) return <p className="text-gray-300">Loading users…</p>;

  // FILTER + SORT
  let filtered = normalizedUsers.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "newest") {
    filtered = filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  if (sortBy === "oldest") {
    filtered = filtered.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }
  if (sortBy === "subscribed_first") {
    filtered = filtered.sort(
      (a, b) =>
        (b.subscriptionStatus === "active") -
        (a.subscriptionStatus === "active")
    );
  }
  if (sortBy === "subscribed_last") {
    filtered = filtered.sort(
      (a, b) =>
        (a.subscriptionStatus === "active") -
        (b.subscriptionStatus === "active")
    );
  }

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const monthOptions = [1, 2, 3, 6, 12];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="p-2 rounded bg-black/40 border border-white/10 w-64 text-white"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 rounded bg-black/40 border border-white/10 text-white"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest Users</option>
          <option value="oldest">Oldest Users</option>
          <option value="subscribed_first">Active Subscribers First</option>
          <option value="subscribed_last">Non-Subscribers First</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Profiles</th>
              <th className="px-3 py-2 text-left">Registered</th>
              <th className="px-3 py-2 text-left">Subscription</th>
              <th className="px-3 py-2 text-left">Subscribed at</th>
              <th className="px-3 py-2 text-left">Ends at</th>
              <th className="px-3 py-2 text-left">Transfer code</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((u) => {
              const isActive = u.subscriptionStatus === "active";
              const busy = !!actionLoading[u._id];
              const showMenu = monthMenuFor === u._id && !isActive;

              return (
                <tr key={u._id} className="border-t border-white/5 align-top">
                  <td className="px-3 py-2">{u.email || "—"}</td>
                  <td className="px-3 py-2">{u.profiles?.length || 0}</td>
                  <td className="px-3 py-2 text-white/80">
                    {fmt(u.createdAt)}
                  </td>

                  <td className="px-3 py-2">
                    {isActive ? (
                      <span className="text-green-400 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </td>

                  <td className="px-3 py-2 text-white/80">
                    {fmt(u._subscribedAt)}
                  </td>
                  <td className="px-3 py-2 text-white/80">
                    {fmt(u._endsAt)}
                  </td>

                  <td className="px-3 py-2">
                    {u.transferCode || u._transferCode ? (
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/10 font-mono">
                        {u.transferCode || u._transferCode}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          disabled={busy}
                          onClick={() => onActivateClick(u)}
                          className={[
                            "px-4 py-2 rounded-xl font-extrabold transition border",
                            busy
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:opacity-90",
                            isActive
                              ? "bg-red-600 border-red-500/30"
                              : "bg-mnflix_light_blue text-black border-white/10",
                          ].join(" ")}
                        >
                          {busy
                            ? "..."
                            : isActive
                            ? "Deactivate"
                            : "Activate / Extend"}
                        </button>

                        <button
                          disabled={busy}
                          onClick={() => deleteUser(u)}
                          className={[
                            "px-4 py-2 rounded-xl font-extrabold transition border",
                            busy
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:opacity-90",
                            "bg-black/40 border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white",
                          ].join(" ")}
                        >
                          Delete
                        </button>
                      </div>

                      {/* Month options menu (only when inactive) */}
                      {showMenu && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {monthOptions.map((m) => (
                            <button
                              key={m}
                              disabled={busy}
                              onClick={() => onSelectMonths(u, m)}
                              className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs hover:bg-white/20"
                            >
                              {m} month{m > 1 ? "s" : ""}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setMonthMenuFor(null)}
                            className="px-3 py-1 rounded-full bg-black/40 border border-white/15 text-xs text-white/70 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4 text-sm text-white/80">
        <span>
          Page {page} of {totalPages} (total {filtered.length} users)
        </span>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1 rounded-lg border border-white/20 ${
              page <= 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-white/10"
            }`}
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-1 rounded-lg border border-white/20 ${
              page >= totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-white/10"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

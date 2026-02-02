"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function AccountPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const API_BASE = "https://mnflix-backend-production.up.railway.app";

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]); // ✅ watch history
  const [loading, setLoading] = useState(true);

  const t = useMemo(() => {
    const dict = {
      mn: {
        account: "Тохиргоо",
        user: "Хэрэглэгч",
        status: "Төлөв",
        active: "Идэвхтэй",
        inactive: "Идэвхгүй",

        start: "Эхэлсэн огноо",
        end: "Дуусах огноо",
        left: "Үлдсэн хугацаа",
        days: "өдөр",
        none: "—",

        subHistory: "Захиалгын түүх",
        noSubHistory: "Одоогоор захиалгын түүх байхгүй.",

        history: "Үзсэн түүх",
        noHistory: "Одоогоор үзсэн зүйл байхгүй.",
        remove: "Устгах",

        security: "Аюулгүй байдал",
        changePassword: "Нууц үг солих",
        devices: "Миний төхөөрөмжүүд",

        changeAvatar: "Зураг солих",
        logout: "Гарах",
      },
      en: {
        account: "Account",
        user: "User",
        status: "Status",
        active: "Active",
        inactive: "Inactive",

        start: "Start date",
        end: "End date",
        left: "Time left",
        days: "days",
        none: "—",

        subHistory: "Subscription history",
        noSubHistory: "No subscription history yet.",

        history: "Watch History",
        noHistory: "No watch history yet.",
        remove: "Remove",

        security: "Security",
        changePassword: "Change Password",
        devices: "My Devices",

        changeAvatar: "Change Avatar",
        logout: "Logout",
      },
    };
    return dict[lang] || dict.mn;
  }, [lang]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoading(false));

    fetch(`${API_BASE}/api/auth/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []));
  }, [router, API_BASE, lang]);

  const formatDateTime = (d) => {
    if (!d) return t.none;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return t.none;
    return dt.toLocaleString(lang === "mn" ? "mn-MN" : "en-US");
  };

  const calcDaysLeft = (endAt) => {
    if (!endAt) return null;
    const end = new Date(endAt).getTime();
    if (Number.isNaN(end)) return null;
    const diff = end - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) return <p className="text-white px-4 pt-24">Loading…</p>;
  if (!user) return <p className="text-red-400 px-4 pt-24">Failed to load.</p>;

  const latestSub =
    Array.isArray(user.subscriptionHistory) && user.subscriptionHistory.length > 0
      ? user.subscriptionHistory[user.subscriptionHistory.length - 1]
      : null;

  const startAt = user.subscriptionStartedAt || latestSub?.startAt || null;
  const endAt = user.subscriptionExpiresAt || latestSub?.endAt || null;

  const daysLeft = calcDaysLeft(endAt);

  return (
    <div className="min-h-screen bg-black text-white max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-10">
      <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10">
        {t.account}
      </h1>

      {/* ✅ SUBSCRIPTION PANEL */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <div className="text-white/60 text-xs sm:text-sm">{t.user}</div>
            <div className="text-lg sm:text-xl font-extrabold mt-1 break-words">
              {user.email || user.phone}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-white/60 text-xs sm:text-sm">{t.status}:</div>
            <span
              className={[
                "px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold border whitespace-nowrap",
                user.subscriptionStatus === "active"
                  ? "text-green-300 border-green-500/30 bg-green-500/10"
                  : "text-red-300 border-red-500/30 bg-red-500/10",
              ].join(" ")}
            >
              {user.subscriptionStatus === "active" ? t.active : t.inactive}
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="text-white/60 text-xs sm:text-sm">{t.start}</div>
            <div className="text-base sm:text-lg font-bold mt-1">
              {formatDateTime(startAt)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="text-white/60 text-xs sm:text-sm">{t.end}</div>
            <div className="text-base sm:text-lg font-bold mt-1">
              {formatDateTime(endAt)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="text-white/60 text-xs sm:text-sm">{t.left}</div>
            <div className="text-base sm:text-lg font-bold mt-1">
              {daysLeft === null ? t.none : `${Math.max(daysLeft, 0)} ${t.days}`}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SUBSCRIPTION HISTORY */}
      <div className="mb-10 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">{t.subHistory}</h2>

        {!Array.isArray(user.subscriptionHistory) || user.subscriptionHistory.length === 0 ? (
          <p className="text-gray-400 text-sm sm:text-base">{t.noSubHistory}</p>
        ) : (
          <div className="space-y-3">
            {user.subscriptionHistory
              .slice()
              .reverse()
              .map((it, idx) => {
                const fmt = (d) =>
                  d ? new Date(d).toLocaleString(lang === "mn" ? "mn-MN" : "en-US") : "—";

                return (
                  <div
                    key={idx}
                    className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
                  >
                    <div className="min-w-0">
                      <div className="text-sm sm:text-lg font-bold break-words">
                        {fmt(it.startAt)} <span className="text-white/40">→</span> {fmt(it.endAt)}
                      </div>

                      <div className="mt-2 inline-flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-xs font-bold">
                          {lang === "mn" ? "Амжилттай" : "Success"}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-white/60 text-xs sm:text-sm">
                        {lang === "mn" ? "Дүн" : "Amount"}
                      </div>
                      <div className="text-xl sm:text-2xl font-extrabold">
                        {new Intl.NumberFormat("mn-MN").format(Number(it.amount || 0))}₮
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ✅ WATCH HISTORY */}
      <div className="mb-10 sm:mb-14">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5">{t.history}</h2>

        {history.length === 0 ? (
          <p className="text-gray-400 text-sm sm:text-base">{t.noHistory}</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
            {history.map((item, index) => (
              <div
                key={`${item.movie?._id}-${index}`}
                className="min-w-[140px] sm:min-w-[160px] relative group cursor-pointer snap-start"
              >
                <img
                  src={
                    item.movie?.thumbnail
                      ? item.movie.thumbnail.startsWith("http")
                        ? item.movie.thumbnail
                        : `${API_BASE}${item.movie.thumbnail}`
                      : "/fallback.jpg"
                  }
                  className="w-[140px] h-[210px] sm:w-[160px] sm:h-[240px] object-cover rounded-xl shadow-lg transition duration-300 group-hover:scale-105"
                  onClick={() =>
                    item.movie?._id && router.push(`/movie/${item.movie._id}`)
                  }
                  alt={item.movie?.title || "movie"}
                />

                {/* show button on mobile always, hover on desktop */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const token = localStorage.getItem("token");

                    await fetch(
                      `${API_BASE}/api/progress/delete/${item.movie?._id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    setHistory((prev) => prev.filter((_, i) => i !== index));
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white text-[11px] px-2 py-1 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                >
                  {t.remove}
                </button>

                <p className="text-xs sm:text-sm mt-2 text-center text-white/90 line-clamp-1">
                  {item.movie?.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ SECURITY */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-6 mb-10 sm:mb-12 max-w-2xl">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{t.security}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/account/change-password")}
            className="mnflix-continue-btn !w-full !py-3 !rounded-xl"
          >
            🔒 {t.changePassword}
          </button>

          <button
            onClick={() => router.push("/account/devices")}
            className="mnflix-continue-btn !w-full !py-3 !rounded-xl"
          >
            📱 {t.devices}
          </button>
        </div>
      </div>

      {/* ✅ PROFILE ACTIONS */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-4">
          {user.currentProfile?.avatar ? (
            <img
              src={user.currentProfile.avatar}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-white/15 object-cover"
              alt="avatar"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-white/70">
              🙂
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-white/70 text-xs sm:text-sm">{t.user}</div>
            <div className="text-base sm:text-lg font-bold break-words">
              {user.email || user.phone}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/account/avatar")}
            className="mnflix-continue-btn !w-full !py-3 !rounded-xl"
          >
            {t.changeAvatar}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("subscriptionActive");
              router.push("/login");
            }}
            className="w-full py-3 rounded-xl font-extrabold bg-red-600 hover:bg-red-700 transition"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}

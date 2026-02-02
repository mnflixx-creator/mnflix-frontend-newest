"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [avatar, setAvatar] = useState(null);
  const [dropdown, setDropdown] = useState(false); // desktop dropdown
  const [mobileMenu, setMobileMenu] = useState(false); // mobile drawer
  const [scrolled, setScrolled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navSug, setNavSug] = useState([]);
  const [navSugOpen, setNavSugOpen] = useState(false);
  const [navSugLoading, setNavSugLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;


  // ✅ NEW: mobile account dropdown
  const [mobileDropdown, setMobileDropdown] = useState(false);

  const { lang, changeLang } = useLanguage();

  // Load profile avatar
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      fetch(`${API_URL}/api/profiles/current`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.currentProfile) setAvatar(data.currentProfile.avatar);
        })
        .catch(() => {});
    }
  }, []);

    useEffect(() => {
      const text = searchText.trim();
      if (!text || !API_URL) {
        setNavSug([]);
        setNavSugOpen(false);
        return;
      }

      const controller = new AbortController();
      const t = setTimeout(async () => {
        try {
          setNavSugLoading(true);
          const uiLang = lang === "mn" ? "mn" : "en";

          const res = await fetch(
            `${API_URL}/api/movies/search/${encodeURIComponent(text)}?lang=${uiLang}`,
            { signal: controller.signal }
          );

          const data = res.ok ? await res.json() : {};
          const tmdbRaw = Array.isArray(data.tmdb) ? data.tmdb : [];

          const sorted = [...tmdbRaw].sort(
            (a, b) => (b.popularity || 0) - (a.popularity || 0)
          );

          setNavSug(sorted.slice(0, 8));
          setNavSugOpen(true);
        } catch (e) {
          if (e.name !== "AbortError") console.log("navbar suggest error:", e);
        } finally {
          setNavSugLoading(false);
        }
      }, 250);

      return () => {
        clearTimeout(t);
        controller.abort();
      };
    }, [searchText, API_URL, lang]);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll blur effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideNavbar = pathname === "/";
  if (hideNavbar) return null;

  const go = (path) => {
    setMobileMenu(false);
    setDropdown(false);
    setMobileDropdown(false); // ✅ NEW
    router.push(path);
  };

  const logout = () => {
    setMobileMenu(false);
    setDropdown(false);
    setMobileDropdown(false); // ✅ NEW
    localStorage.removeItem("token");
    localStorage.removeItem("subscriptionActive");
    localStorage.removeItem("reset_email");
    router.push("/login");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    setMobileMenu(false);
    setMobileDropdown(false); // ✅ NEW
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const toggleNotifications = async () => {
    const willOpen = !notificationsOpen;
    setNotificationsOpen(willOpen);
    if (willOpen) {
      await loadNotifications();
    }
  };
  async function loadNotifications() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !API_URL) return;

    try {
      const res = await fetch(`${API_URL}/api/reports/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      setNotifications(data);
      setUnreadCount(
        data.filter((r) => r.adminReply && !r.userSeenReply).length
      );
    } catch (e) {
      console.log("Notifications load error:", e);
    }
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markReplySeen = async (id) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !API_URL) return;

    try {
      await fetch(`${API_URL}/api/reports/${id}/seen-reply`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, userSeenReply: true } : r
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.log("Seen reply error:", e);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full px-6 flex items-center justify-between
        z-[9999] h-20 transition-all pointer-events-auto
        ${scrolled ? "bg-black/90 backdrop-blur-lg shadow-lg shadow-lg" : "bg-black/40 backdrop-blur-md"}`}
      >
        {/* ========================= */}
        {/* ✅ MOBILE TOP BAR (ONLY)  */}
        {/* ========================= */}
        <div className="md:hidden w-full flex items-center justify-between">
          <button
            className="text-white text-3xl w-10 h-10 flex items-center justify-center rounded hover:bg-white/10"
            onClick={() => {
              setMobileDropdown(false); // ✅ NEW
              setMobileMenu(true);
            }}
            aria-label="Menu"
          >
            ☰
          </button>

          <img
            src="/logo.png"
            alt="MNFLIX"
            className="h-23 object-contain cursor-pointer"
            onClick={() => go("/home")}
          />

          <div className="flex items-center gap-1">
            {/* 🔔 mobile notifications */}
            <button
              onClick={() => {
                setMobileMenu(false);
                setMobileDropdown(false);
                toggleNotifications();
              }}
              className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10"
              aria-label="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="ml-[-8px] mt-[-10px] bg-red-500 text-[10px] rounded-full px-1.5 py-[1px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* account button */}
            <button
              onClick={() => {
                setMobileMenu(false);
                setMobileDropdown((prev) => !prev);
              }}
              className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10"
              aria-label="Account"
            >
              {avatar ? (
                <img
                  src={avatar}
                  className="w-8 h-8 rounded object-cover"
                  alt="avatar"
                />
              ) : (
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 21a8 8 0 10-16 0"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 13a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ========================= */}
        {/* ✅ DESKTOP NAV (ONLY)     */}
        {/* ========================= */}
        <div className="hidden md:flex w-full items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="cursor-pointer" onClick={() => router.push("/home")}>
              <img
                src="/logo.png"
                className="h-24 w-auto object-contain cursor-pointer"
                alt="MNFLIX"
              />
            </div>

            <div className="hidden md:flex items-center gap-6 text-gray-300 font-medium">
              <button onClick={() => router.push("/home")} className="hover:text-white transition">
                {lang === "mn" ? "Нүүр" : "Home"}
              </button>
              <button onClick={() => router.push("/series")} className="hover:text-white transition">
                {lang === "mn" ? "Цуврал" : "Series"}
              </button>
              <button onClick={() => router.push("/movies")} className="hover:text-white transition">
                {lang === "mn" ? "Кинонууд" : "Movies"}
              </button>
              <button onClick={() => router.push("/anime")} className="hover:text-white transition">
                {lang === "mn" ? "Анимэ" : "Anime"}
              </button>
              <button onClick={() => router.push("/kdrama")} className="hover:text-white transition">
                {lang === "mn" ? "К-Драм" : "K-Drama"}
              </button>
              <button onClick={() => router.push("/my-list")} className="hover:text-white transition">
                {lang === "mn" ? "Миний жагсаалт" : "My List"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 text-gray-300 font-medium">
            {/* 🔔 desktop notifications */}
            <div className="hidden md:block relative">
              <button
                onClick={toggleNotifications}
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Notifications"
              >
                <span className="text-lg">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] rounded-full px-1.5 py-[1px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => router.push("/subscribe")}
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {lang === "mn" ? "Гишүүнчлэл" : "Subscribe"}
            </button>

            <button
              onClick={() => changeLang("mn")}
              className={`transition ${lang === "mn" ? "text-blue-400 font-bold" : "hover:text-white"}`}
            >
              MN
            </button>
            <button
              onClick={() => changeLang("en")}
              className={`transition ${lang === "en" ? "text-blue-400 font-bold" : "hover:text-white"}`}
            >
              EN
            </button>

            <div className="relative">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => navSug.length && setNavSugOpen(true)}
                onBlur={() => setTimeout(() => setNavSugOpen(false), 120)}
                enterKeyHint="search"
                inputMode="search"
                type="text"
                placeholder={lang === "mn" ? "Хайх..." : "Search..."}
                className="px-3 py-1 rounded bg-white/10 text-white w-32 focus:w-48 transition-all outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = searchText.trim();
                    if (!q) return;
                    setNavSugOpen(false);
                    router.push(`/search?q=${encodeURIComponent(q)}`);
                  }
                }}
              />

              {/* ✅ DROPDOWN */}
              {navSugOpen && (
                <div className="absolute right-0 mt-2 w-[340px] max-w-[85vw] bg-black/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[10050]">
                  {navSugLoading && (
                    <div className="px-4 py-3 text-sm text-white/60">
                      {lang === "mn" ? "Хайж байна..." : "Searching..."}
                    </div>
                  )}

                  {!navSugLoading && navSug.length === 0 && (
                    <div className="px-4 py-3 text-sm text-white/60">
                      {lang === "mn" ? "Олдсонгүй" : "No results"}
                    </div>
                  )}

                  {!navSugLoading &&
                    navSug.map((item) => {
                      const posterPath = item.poster_path || item.backdrop_path || "";
                      const imgSrc = posterPath
                        ? `https://image.tmdb.org/t/p/w92${posterPath}`
                        : null;

                      const title = item.forcedTitle || item.title || item.name || "";
                      const year =
                        item.forcedYear ||
                        (item.release_date || item.first_air_date || "").slice(0, 4);

                      return (
                        <button
                          key={`${item.media_type}-${item.id}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()} // ✅ prevents blur before click
                          onClick={() => {
                            setNavSugOpen(false);
                            router.push(`/search?q=${encodeURIComponent(title)}`);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 flex gap-3 items-center"
                        >
                          <div className="w-10 h-14 bg-white/5 rounded overflow-hidden flex items-center justify-center text-[10px] text-gray-500">
                            {imgSrc ? (
                              <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                            ) : (
                              "—"
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-white font-semibold truncate">{title}</div>
                            <div className="text-white/50 text-xs">
                              {year} • {item.media_type === "tv" ? "Series" : "Movie"}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  className="w-10 h-10 rounded cursor-pointer hover:scale-105 transition object-cover"
                  onClick={() => setDropdown(!dropdown)}
                  alt="avatar"
                />
              ) : (
                <button className="hover:text-white transition" onClick={() => setDropdown(!dropdown)}>
                  Account
                </button>
              )}

              {dropdown && (
                <div className="absolute right-0 mt-2 bg-black/90 border border-gray-700 rounded-lg w-48 py-2 shadow-xl">
                  <button
                    onClick={() => go("/profiles")}
                    className="block w-full text-left px-4 py-2 hover:bg-white/10"
                  >
                    {lang === "mn" ? "Профайл солих" : "Switch Profile"}
                  </button>

                  <button
                    onClick={() => go("/account")}
                    className="block w-full text-left px-4 py-2 hover:bg-white/10"
                  >
                    {lang === "mn" ? "Аккаунт" : "Account"}
                  </button>

                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-white/10 text-red-400"
                  >
                    {lang === "mn" ? "Гарах" : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 🔔 NOTIFICATIONS PANEL */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-[10002] flex justify-end">
          <div
            className="flex-1"
            onClick={() => setNotificationsOpen(false)}
          />
          <div className="w-full max-w-md md:mt-20 md:mr-6 bg-black/95 border border-white/10 rounded-l-2xl md:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold">
                {lang === "mn" ? "Мэдэгдэл" : "Notifications"}
              </span>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 && (
                <div className="px-4 py-6 text-xs text-white/50">
                  {lang === "mn"
                    ? "Одоогоор мэдэгдэл алга."
                    : "No notifications yet."}
                </div>
              )}

              {notifications.map((n) => {
                const hasReply = !!n.adminReply;
                const unread = hasReply && !n.userSeenReply;

                return (
                  <button
                    key={n._id}
                    onClick={() => {
                      if (unread) markReplySeen(n._id);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 text-xs
                      ${unread ? "bg-white/5" : "bg-transparent hover:bg-white/5"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {n.movie?.title || "Movie"}
                      </span>
                      {unread && (
                        <span className="ml-2 inline-block rounded-full bg-red-500 px-2 py-[1px] text-[10px]">
                          New
                        </span>
                      )}
                    </div>

                    {n.message && (
                      <div className="mt-1 text-white/70">
                        {lang === "mn" ? "Таны тайлан:" : "Your report:"}{" "}
                        {n.message}
                      </div>
                    )}

                    {hasReply && (
                      <div className="mt-1 text-green-300">
                        {lang === "mn" ? "Админы хариу:" : "Admin reply:"}{" "}
                        {n.adminReply}
                      </div>
                    )}

                    <div className="mt-1 text-[10px] text-white/40">
                      {new Date(n.repliedAt || n.createdAt).toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ✅ MOBILE ACCOUNT DROPDOWN (ONLY) */}
      {mobileDropdown && (
        <div className="md:hidden fixed inset-0 z-[10001]">
          <div
            className="absolute inset-0"
            onClick={() => setMobileDropdown(false)}
          />

          <div className="absolute top-20 right-4 bg-black/95 border border-white/10 rounded-lg w-52 py-2 shadow-2xl">
            <button
              onClick={() => go("/profiles")}
              className="block w-full text-left px-4 py-2 hover:bg-white/10 text-white"
            >
              {lang === "mn" ? "Профайл солих" : "Switch Profile"}
            </button>

            <button
              onClick={() => go("/account")}
              className="block w-full text-left px-4 py-2 hover:bg-white/10 text-white"
            >
              {lang === "mn" ? "Аккаунт" : "Account"}
            </button>

            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 hover:bg-white/10 text-red-400"
            >
              {lang === "mn" ? "Гарах" : "Logout"}
            </button>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* ✅ MOBILE DRAWER (ONLY)   */}
      {/* ========================= */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-[10000] transition ${
            mobileMenu ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            onClick={() => setMobileMenu(false)}
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              mobileMenu ? "opacity-70" : "opacity-0"
            }`}
          />

          <div
            className={`absolute top-0 left-0 h-screen w-[88%] max-w-[360px]
            bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-black
            border-r border-white/10
            transform transition-transform duration-300
            flex flex-col ${
              mobileMenu ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* ✅ UPGRADED HEADER (NO LOGO) */}
            <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img
                    src={avatar}
                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    👤
                  </div>
                )}

                <div className="leading-tight">
                  <div className="text-sm text-white font-semibold">
                    {lang === "mn" ? "Цэс" : "Menu"}
                  </div>
                  <div className="text-xs text-white/40">MNFLIX</div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenu(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full
                bg-white/5 hover:bg-white/10 text-white text-xl border border-white/10"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* ✅ SCROLL AREA (THIS FIXES YOUR PHONE ISSUE) */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24 [padding-bottom:calc(6rem+env(safe-area-inset-bottom))]">
              <form onSubmit={submitSearch} className="mt-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    🔍
                  </span>

                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    enterKeyHint="search"
                    inputMode="search"
                    placeholder={lang === "mn" ? "Хайх..." : "Search..."}
                    className="w-full pl-10 pr-4 py-3 rounded-xl
                    bg-white/5 border border-white/10
                    outline-none focus:border-blue-500 text-white placeholder:text-white/40"
                  />
                </div>

                {/* ✅ BIG SEARCH BUTTON (PHONE FRIENDLY) */}
                <button
                  type="submit"
                  disabled={!searchText.trim()}
                  className="mt-3 w-full py-3 rounded-xl font-semibold
                  bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🔍 {lang === "mn" ? "Хайх" : "Search"}
                </button>
              </form>
              {/* Subscribe */}
              <button
                onClick={() => go("/subscribe")}
                className="mt-4 w-full py-3 rounded-xl
                bg-blue-600 hover:bg-blue-700 font-semibold
                shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
              >
                {lang === "mn" ? "Гишүүнчлэл" : "Subscribe"}
              </button>

              {/* Language */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeLang("mn")}
                  className={`py-2.5 rounded-xl border border-white/10 transition
                  ${lang === "mn" ? "bg-white/10 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
                >
                  MN
                </button>
                <button
                  onClick={() => changeLang("en")}
                  className={`py-2.5 rounded-xl border border-white/10 transition
                  ${lang === "en" ? "bg-white/10 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
                >
                  EN
                </button>
              </div>

              {/* Sections */}
              <div className="mt-5">
                <p className="text-xs uppercase tracking-widest text-white/40 px-2">
                  {lang === "mn" ? "Аккаунт" : "Account"}
                </p>

                <div className="mt-2 space-y-2">
                  <ProMenuItem onClick={() => go("/profiles")} label={lang === "mn" ? "Профайл солих" : "Switch Profile"} icon="👤" />
                  <ProMenuItem onClick={() => go("/account")} label={lang === "mn" ? "Аккаунт" : "Account"} icon="⚙️" />
                  <ProMenuItem
                    onClick={() => {
                      setMobileMenu(false);
                      toggleNotifications();
                    }}
                    label={lang === "mn" ? "Мэдэгдэл" : "Notifications"}
                    icon="🔔"
                  />
                </div>

                <div className="h-px bg-white/10 my-5" />

                <p className="text-xs uppercase tracking-widest text-white/40 px-2">
                  {lang === "mn" ? "Цэс" : "Menu"}
                </p>

                <div className="mt-2 space-y-2">
                  <ProMenuItem onClick={() => go("/home")} label={lang === "mn" ? "Нүүр" : "Home"} icon="🏠" />
                  <ProMenuItem onClick={() => go("/movies")} label={lang === "mn" ? "Кино" : "Movies"} icon="🎬" />
                  <ProMenuItem onClick={() => go("/series")} label={lang === "mn" ? "Цуврал" : "Series"} icon="📺" />
                  <ProMenuItem onClick={() => go("/anime")} label={lang === "mn" ? "Анимэ" : "Anime"} icon="✨" />
                  <ProMenuItem onClick={() => go("/kdrama")} label={lang === "mn" ? "К-Драм" : "K-Drama"} icon="🎭" />
                  <ProMenuItem onClick={() => go("/my-list")} label={lang === "mn" ? "Миний жагсаалт" : "My List"} icon="❤️" />
                </div>

                <div className="h-px bg-white/10 my-5" />

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                  bg-red-500/10 hover:bg-red-500/15 border border-red-500/20
                  text-red-300 transition"
                >
                  <span className="flex items-center gap-3">
                    <span>🚪</span>
                    <span>{lang === "mn" ? "Гарах" : "Log out"}</span>
                  </span>
                  <span className="text-red-300/70">›</span>
                </button>

                <div className="mt-6 text-center text-xs text-white/30">
                  MNFLIX • v1
                </div>
              </div>
            </div>
            {/* ✅ END SCROLL AREA */}
          </div>
        </div>
      </div>
    </>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded transition
      ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white hover:bg-white/10"}`}
    >
      {label}
    </button>
  );
}

function ProMenuItem({ label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl
      bg-white/5 hover:bg-white/10 border border-white/10
      text-white transition"
    >
      <span className="flex items-center gap-3">
        <span className="opacity-80">{icon}</span>
        <span className="font-medium">{label}</span>
      </span>
      <span className="text-white/40">›</span>
    </button>
  );
}

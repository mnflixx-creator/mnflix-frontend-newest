"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MobileDrawerNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const go = (path) => {
    setOpen(false);
    router.push(path);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("subscriptionActive");
    localStorage.removeItem("reset_email");
    setOpen(false);
    router.push("/login");
  };

  const search = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      {/* ✅ MOBILE TOP BAR (NO SEARCH BUTTON HERE) */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 grid place-items-center rounded-md hover:bg-white/10"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Center Logo */}
          <button
            onClick={() => go("/home")}
            className="flex items-center gap-2"
            aria-label="Go home"
          >
            <img src="/logo.png" alt="MNFLIX" className="h-7 object-contain" />
          </button>

          {/* Right spacer (keeps logo centered) */}
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* ✅ OVERLAY */}
      {open && (
        <button
          className="lg:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      {/* ✅ DRAWER */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-[84%] max-w-[320px] z-[60]
        bg-[#0b0b0b] border-r border-white/10
        transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <img src="/logo.png" alt="MNFLIX" className="h-7 object-contain" />
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 grid place-items-center rounded-md hover:bg-white/10"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div className="p-4 space-y-4">
          {/* Search inside drawer */}
          <form onSubmit={search} className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-white/10 text-white placeholder:text-white/50 rounded-md px-3 py-2 outline-none border border-white/10 focus:border-white/30"
            />
            <button className="px-3 py-2 rounded-md bg-white text-black font-semibold">
              Go
            </button>
          </form>

          {/* Subscribe */}
          <button
            onClick={() => go("/subscribe")}
            className="w-full py-2.5 rounded-md bg-[#2EA8FF] hover:bg-[#4FB5FF] text-white font-semibold"
          >
            Гишүүнчлэл
          </button>

          {/* Links */}
          <div className="space-y-1">
            <NavItem label="Нүүр" onClick={() => go("/home")} />
            <NavItem label="Кино" onClick={() => go("/movies")} />
            <NavItem label="Цуврал" onClick={() => go("/series")} />
            <NavItem label="Анимэ" onClick={() => go("/anime")} />
            <NavItem label="Шинэ" onClick={() => go("/new")} />
            <NavItem label="Миний жагсаалт" onClick={() => go("/my-list")} />
            <div className="h-[1px] bg-white/10 my-2" />
            <NavItem label="Account" onClick={() => go("/account")} />
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-md border border-white/20 hover:bg-white/10 text-white font-semibold"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

function NavItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white"
    >
      {label}
    </button>
  );
}

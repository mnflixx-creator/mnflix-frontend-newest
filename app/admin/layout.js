"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Movies", href: "/admin/movies" },
  { label: "Series", href: "/admin/series" },
  { label: "Adult (18+)", href: "/admin/adult" },
  { label: "Home Page Editor", href: "/admin/home-editor" },
  // { label: "Trending", href: "/admin/trending" },  <-- REMOVED
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Devices", href: "/admin/devices" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Bank & Pricing", href: "/admin/bank-settings" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // 🔐 Protect all /admin pages except /admin/login
  useEffect(() => {
    if (!pathname.startsWith("/admin")) return;

    if (pathname.startsWith("/admin/login")) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;

    if (!token) {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  // For /admin/login we don't show sidebar
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black/70 border-r border-white/10 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-[0.2em] text-[#2EA8FF]">
            MNFLIX
          </h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  active
                    ? "bg-[#2EA8FF] text-black font-semibold"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            router.push("/admin/login");
          }}
          className="mt-4 w-full px-3 py-2 rounded bg-red-500/80 hover:bg-red-500 text-sm font-semibold"
        >
          Logout
        </button>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

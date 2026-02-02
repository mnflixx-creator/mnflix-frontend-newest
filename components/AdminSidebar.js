"use client";

import { useRouter, usePathname } from "next/navigation";

export default function AdminSidebar({ mode, toggleMode }) {
  const router = useRouter();
  const pathname = usePathname();

  const linkClasses = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-between ${
      pathname === path
        ? "bg-[#1f2937] text-white"
        : "text-gray-300 hover:bg-[#111827]"
    }`;

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
    }
    router.push("/admin/login");
  };

  const isDark = mode === "dark";

  return (
    <aside
      className={`w-64 border-r ${
        isDark ? "border-white/10 bg-[#020617]" : "border-gray-300 bg-white"
      } flex flex-col`}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <h1 className="text-xl font-extrabold tracking-[0.25em] text-[#2EA8FF]">
          MNFLIX
        </h1>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
        <div
          className={linkClasses("/admin/dashboard")}
          onClick={() => router.push("/admin/dashboard")}
        >
          <span>📊 Dashboard</span>
        </div>

        <div
          className={linkClasses("/admin/users")}
          onClick={() => router.push("/admin/users")}
        >
          <span>👥 Users</span>
        </div>

        <div
          className={linkClasses("/admin/movies")}
          onClick={() => router.push("/admin/movies")}
        >
          <span>🎬 Movies</span>
        </div>

        <div
          className={linkClasses("/admin/trending")}
          onClick={() => router.push("/admin/trending")}
        >
          <span>🔥 Trending Manager</span>
        </div>

        <div
          className={linkClasses("/admin/add-movie")}
          onClick={() => router.push("/admin/add-movie")}
        >
          <span>➕ Add Movie</span>
        </div>

        <div
          className={linkClasses("/admin/bank-settings")}
          onClick={() => router.push("/admin/bank-settings")}
        >
          <span>🏦 Bank & Pricing</span>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-3">
        <button
          onClick={toggleMode}
          className="w-full text-xs px-3 py-2 rounded border border-white/20 hover:border-[#2EA8FF]"
        >
          {isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        <button
          onClick={logout}
          className="w-full text-xs px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const link = (path, label) => (
    <Link
      href={path}
      className={`block px-5 py-3 rounded-md text-sm font-medium
        ${pathname.startsWith(path) ? "bg-blue-600" : "hover:bg-gray-700"}
      `}
    >
      {label}
    </Link>
  );

  return (
    <aside className="w-64 bg-gray-800 p-5 flex flex-col gap-2 border-r border-gray-700">
      <h1 className="text-2xl font-bold mb-3">MNFLIX Admin</h1>

      {link("/admin/dashboard", "Dashboard")}
      {link("/admin/users", "Users")}
      {link("/admin/movies", "Movies")}
      {link("/admin/movies/add", "Add Movie")}
      {link("/admin/trending", "Trending Manager")}
      {link("/admin/home-editor", "Home Page Editor")}
      {link("/admin/bank-settings", "Bank & Pricing")}

      <button
        className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        onClick={() => {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        }}
      >
        Logout
      </button>
    </aside>
  );
}

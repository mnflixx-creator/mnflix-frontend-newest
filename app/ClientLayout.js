"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "./context/LanguageContext";
import StreamSocketClient from "./StreamSocketClient";
import DisableDevtool from "disable-devtool";
import LegacyCssLoader from "./LegacyCssLoader";
import LegacySpatialNav from "./LegacySpatialNav";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Disable devtools for non-admin users
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    DisableDevtool({
      ignore: () => !!localStorage.getItem("adminToken"),
      disableMenu: true,
      clearLog: true,
    });
  }, []);

  const isAdmin = pathname.startsWith("/admin");

  const hideNavbar =
    pathname.startsWith("/register") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/otp") ||
    pathname.startsWith("/add-profile") ||
    pathname.startsWith("/profiles") ||
    pathname.startsWith("/forgot-password");

  return (
    <>
      {/* ✅ STREAM SOCKET CLIENT — REAL-TIME DEVICE KICK */}
      <StreamSocketClient />

      <LegacyCssLoader />
      <LegacySpatialNav />

      <LanguageProvider>
        {!isAdmin && !hideNavbar && <Navbar />}

        <div className={hideNavbar ? "pt-0" : "pt-20"}>{children}</div>
      </LanguageProvider>
    </>
  );
}

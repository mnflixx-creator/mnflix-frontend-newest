"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "./context/LanguageContext";
import StreamSocketClient from "./StreamSocketClient";
import DisableDevtool from "disable-devtool";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Disable devtools for non-admin users
  useEffect(() => {
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

      <LanguageProvider>
        {!isAdmin && !hideNavbar && <Navbar />}

        <div className={hideNavbar ? "pt-0" : "pt-20"}>{children}</div>
      </LanguageProvider>
    </>
  );
}

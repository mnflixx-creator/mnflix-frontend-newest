"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const LEGACY_BASE = [
  "/legacy/base.css",
  "/legacy/layout.css",
  "/legacy/common-components.css",
];

const ROUTE_CSS_MAP = [
  { match: (p) => p === "/", css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/home"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/login"), css: ["/legacy/login.css"] },
  { match: (p) => p.startsWith("/register"), css: ["/legacy/register.css"] },
  { match: (p) => p.startsWith("/profiles"), css: ["/legacy/profiles.css"] },
  { match: (p) => p.startsWith("/add-profile"), css: ["/legacy/profiles.css"] },
  { match: (p) => p.startsWith("/forgot-password"), css: ["/legacy/login.css"] },
  { match: (p) => p.startsWith("/account"), css: ["/legacy/account.css"] },
  { match: (p) => p.startsWith("/my-list"), css: ["/legacy/account.css"] },
  { match: (p) => p.startsWith("/search"), css: ["/legacy/search.css"] },
  { match: (p) => p.startsWith("/movie"), css: ["/legacy/watch.css"] },
  { match: (p) => p.startsWith("/series"), css: ["/legacy/watch.css"] },
  { match: (p) => p.startsWith("/anime"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/kdrama"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/cdrama"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/adult"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/new"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/movies"), css: ["/legacy/home.css"] },
  { match: (p) => p.startsWith("/subscribe"), css: ["/legacy/account.css"] },
];

function ensureLink(href) {
  if (document.querySelector(`link[data-legacy-css="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-legacy-css", href);
  document.head.appendChild(link);
}

export default function LegacyCssLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("no-layer")) return;

    const files = new Set(LEGACY_BASE);

    for (const rule of ROUTE_CSS_MAP) {
      if (rule.match(pathname)) {
        for (const css of rule.css) files.add(css);
        break;
      }
    }

    for (const href of files) ensureLink(href);
  }, [pathname]);

  return null;
}

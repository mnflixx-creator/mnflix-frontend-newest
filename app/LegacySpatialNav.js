"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [role="button"], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

function isVisible(el) {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  return true;
}

function getFocusableElements() {
  const nodes = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR));
  return nodes.filter((el) => {
    const tabIndex = el.tabIndex;
    if (tabIndex < 0) return false;
    if (el.disabled) return false;
    return isVisible(el);
  });
}

function centerOf(rect) {
  return {
    x: (rect.left + rect.right) / 2,
    y: (rect.top + rect.bottom) / 2,
  };
}

function findNext(current, candidates, direction) {
  if (!current) return candidates[0] || null;
  const curRect = current.getBoundingClientRect();
  const curCenter = centerOf(curRect);

  let best = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const c = centerOf(r);

    let primary = 0;
    let secondary = 0;
    let valid = false;

    if (direction === "right") {
      primary = r.left - curRect.right;
      secondary = Math.abs(c.y - curCenter.y);
      valid = primary > 1;
    } else if (direction === "left") {
      primary = curRect.left - r.right;
      secondary = Math.abs(c.y - curCenter.y);
      valid = primary > 1;
    } else if (direction === "down") {
      primary = r.top - curRect.bottom;
      secondary = Math.abs(c.x - curCenter.x);
      valid = primary > 1;
    } else if (direction === "up") {
      primary = curRect.top - r.bottom;
      secondary = Math.abs(c.x - curCenter.x);
      valid = primary > 1;
    }

    if (!valid) continue;

    const score = primary * 1000 + secondary;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

function scrollIntoViewSafe(el) {
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    try {
      el.scrollIntoView();
    } catch {}
  }
}

export default function LegacySpatialNav() {
  useEffect(() => {
    const root = document.documentElement;
    let enabled = false;

    const enable = () => {
      if (enabled) return;
      enabled = true;

      const ensureInitialFocus = () => {
        const focusable = getFocusableElements();
        if (!focusable.length) return;
        const active = document.activeElement;
        if (!active || !focusable.includes(active)) {
          focusable[0].focus();
          scrollIntoViewSafe(focusable[0]);
        }
      };

      const onKeyDown = (e) => {
        if (!root.classList.contains("no-layer")) return;

        const key = e.key;
        const active = document.activeElement;

        if (
          (key === "Enter" || key === " ") &&
          active &&
          active.getAttribute("role") === "button"
        ) {
          e.preventDefault();
          active.click();
          return;
        }

        if (
          (key === "Backspace" || key === "Escape" || key === "BrowserBack") &&
          active &&
          (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
        ) {
          return;
        }

        if (
          key === "Backspace" ||
          key === "Escape" ||
          key === "BrowserBack"
        ) {
          e.preventDefault();
          if (window.history.length > 1) window.history.back();
          return;
        }
        let dir = null;
        if (key === "ArrowRight") dir = "right";
        if (key === "ArrowLeft") dir = "left";
        if (key === "ArrowDown") dir = "down";
        if (key === "ArrowUp") dir = "up";
        if (!dir) return;

        const focusable = getFocusableElements();
        if (!focusable.length) return;

        e.preventDefault();

        const current = document.activeElement;
        if (!current || !focusable.includes(current)) {
          focusable[0].focus();
          scrollIntoViewSafe(focusable[0]);
          return;
        }
        const next = findNext(current, focusable, dir);
        if (next) {
          next.focus();
          scrollIntoViewSafe(next);
        }
      };

      document.addEventListener("keydown", onKeyDown);
      setTimeout(ensureInitialFocus, 300);

      const cleanup = () => {
        document.removeEventListener("keydown", onKeyDown);
      };

      window.addEventListener("beforeunload", cleanup);
    };

    if (root.classList.contains("no-layer")) {
      enable();
    }

    const observer = new MutationObserver(() => {
      if (root.classList.contains("no-layer")) enable();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

let socket = null;

function getDeviceId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("deviceId");
  if (!id) {
    if (window.crypto?.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = "dev_" + Math.random().toString(36).slice(2);
    }
    localStorage.setItem("deviceId", id);
  }
  return id;
}

export default function StreamSocketClient() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const API_URL = "https://mnflix-backend-production.up.railway.app";
    if (!API_URL) {
      console.error("Missing NEXT_PUBLIC_API_URL");
      return;
    }

    const deviceId = getDeviceId();
    let cancelled = false;

    (async () => {
      try {
        // get userId
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json();
        const userId = meData.user?._id;
        if (!userId || cancelled) return;

        socket = io(API_URL, {
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          socket.emit("join-user", userId);
        });

        socket.on("force-logout", (payload) => {
          if (payload?.deviceId && payload.deviceId !== deviceId) return;

          alert(
            "Your MNFLIX account was logged out from this device because another device was removed or started streaming."
          );
          localStorage.removeItem("token");
          window.location.href = "/login";
        });
      } catch (err) {
        console.error("Socket init error", err);
      }
    })();

    return () => {
      cancelled = true;
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return null;
}

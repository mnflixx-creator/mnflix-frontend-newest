"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function DevicesPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  // ✅ ONLY ADDITION
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [devices, setDevices] = useState([]);
  const [activeStreamDeviceId, setActiveStreamDeviceId] = useState(null);
  const [currentDeviceId, setCurrentDeviceId] = useState(null); // 🆕
  const [loading, setLoading] = useState(true);

  // 🌐 Translations
  const t = {
    title: lang === "mn" ? "Миний төхөөрөмжүүд" : "My Devices",
    subtitle:
      lang === "mn"
        ? "Таны MNFLIX аккаунтаар нэвтэрсэн төхөөрөмжүүд. Хүссэн төхөөрөмжөө устгаж болно."
        : "These are the devices logged into your MNFLIX account. You can remove any device.",
    currentDevice:
      lang === "mn" ? "Одоогоор үзэж байгаа" : "Currently Streaming",
    thisDevice:
      lang === "mn" ? "Одоо ашиглаж буй төхөөрөм" : "This device", // 🆕
    lastActive: lang === "mn" ? "Сүүлд идэвхтэй байсан" : "Last active",
    ip: "IP",
    remove: lang === "mn" ? "Төхөөрөмж устгах" : "Remove device",
    noDevices:
      lang === "mn"
        ? "Одоогоор бүртгэлтэй төхөөрөмж алга."
        : "No devices registered yet.",
    back: lang === "mn" ? "Буцах" : "Back",
    confirmDelete:
      lang === "mn"
        ? "Энэ төхөөрөмжийг аккаунтаасаа гаргах уу?"
        : "Remove this device from your account?",
  };

  // ⏱ Format date
  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const deviceId = localStorage.getItem("deviceId"); // 🆕 same as movie page

    fetch(`${API_BASE}/api/account/devices`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-device-id": deviceId || "", // 🆕 tell backend which one is "me"
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load devices");
        }
        return res.json();
      })
      .then((data) => {
        setDevices(data.devices || []);
        setActiveStreamDeviceId(data.activeStreamDeviceId || null);
        setCurrentDeviceId(data.currentDeviceId || null); // 🆕 mark my device
      })
      .catch((err) => {
        console.error("Devices load error:", err);
      })
      .finally(() => setLoading(false));
  }, [API_BASE, router]); // router was used, add to deps

  // 🗑 Remove device
  const removeDevice = async (deviceId) => {
    if (!confirm(t.confirmDelete)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    await fetch(`${API_BASE}/api/account/devices/${deviceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));

    if (activeStreamDeviceId === deviceId) {
      setActiveStreamDeviceId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-20">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-gray-400 mt-2">{t.subtitle}</p>
        </div>

        <button
          onClick={() => router.push("/account")}
          className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md"
        >
          ← {t.back}
        </button>
      </div>

      {/* No devices */}
      {devices.length === 0 ? (
        <p className="text-gray-400">{t.noDevices}</p>
      ) : (
        <div className="space-y-4">
          {devices.map((dev) => {
            const isActive = activeStreamDeviceId === dev.deviceId;
            const isThisDevice = currentDeviceId === dev.deviceId; // 🆕 mine

            return (
              <div
                key={dev.deviceId}
                className="flex items-center justify-between bg-[#111827] border border-white/10 rounded-xl p-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">
                      {dev.deviceName || "Device"}
                    </p>

                    {isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-400/40">
                        ● {t.currentDevice}
                      </span>
                    )}

                    {isThisDevice && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/40">
                        ★ {t.thisDevice}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    ID: <span className="font-mono">{dev.deviceId}</span>
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {t.ip}:{" "}
                    <span className="font-mono">
                      {dev.lastIP || "-"}
                    </span>
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {t.lastActive}: {formatDate(dev.lastActive)}
                  </p>
                </div>

                <button
                  onClick={() => removeDevice(dev.deviceId)}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md font-semibold"
                >
                  {t.remove}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

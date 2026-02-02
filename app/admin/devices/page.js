"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function AdminDevicesPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === "mn" ? "Идэвхтэй төхөөрөмжүүд" : "Active Devices",
    email: lang === "mn" ? "И-мэйл" : "Email",
    device: lang === "mn" ? "Төхөөрөмж" : "Device",
    streaming: lang === "mn" ? "Одоо үзэж байна" : "Streaming Now",
    kick: lang === "mn" ? "Салгаx" : "Force Logout",
    empty:
      lang === "mn"
        ? "Одоогоор идэвхтэй төхөөрөмж байхгүй."
        : "No active devices.",
    confirm:
      lang === "mn"
        ? "Энэ төхөөрөмжийг салгах уу?"
        : "Kick this device?",
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/admin/devices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data || []))
      .finally(() => setLoading(false));
  }, [router]);

  // ✅ Kick Device
  const kickDevice = async (userId, deviceId) => {
    if (!confirm(t.confirm)) return;

    const token = localStorage.getItem("adminToken");

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/admin/kick-device`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, deviceId }),
      }
    );

    // Remove from UI immediately
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId
          ? {
              ...u,
              devices: u.devices.filter((d) => d.deviceId !== deviceId),
            }
          : u
      )
    );
  };

  if (loading) return <p className="text-white mt-20 px-6">Loading…</p>;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">{t.title}</h1>

      {users.length === 0 ? (
        <p className="text-gray-400">{t.empty}</p>
      ) : (
        <div className="space-y-8">
          {users.map((user) => (
            <div
              key={user._id}
              className="border border-white/10 rounded-xl bg-[#111] p-6"
            >
              <p className="font-semibold mb-4">
                {t.email}: {user.email}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {user.devices.map((d) => (
                  <div
                    key={d.deviceId}
                    className={`border border-white/10 p-4 rounded-lg ${
                      d.isStreaming ? "ring-2 ring-green-400" : ""
                    }`}
                  >
                    <p className="text-sm mb-1">ID: {d.deviceId}</p>
                    <p className="text-sm mb-1">
                      {lang === "mn" ? "Нэр:" : "Name:"} {d.deviceName}
                    </p>
                    <p className="text-sm mb-2 text-gray-400">
                      IP: {d.lastIP}
                    </p>

                    {d.isStreaming && (
                      <p className="text-xs mb-3 bg-green-600 inline-block px-2 py-1 rounded">
                        {t.streaming}
                      </p>
                    )}

                    <button
                      onClick={() => kickDevice(user._id, d.deviceId)}
                      className="bg-red-600 px-4 py-2 rounded text-sm hover:bg-red-700"
                    >
                      {t.kick}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

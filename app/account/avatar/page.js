"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function AvatarPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const t = useMemo(() => {
    return lang === "mn"
      ? {
          title: "Зураг сонгох",
          subtitle: "Профайл зураг сонгоод хадгална уу.",
          back: "← Буцах",
          saving: "Хадгалж байна...",
          errorTitle: "Алдаа гарлаа",
          loginRequired: "Нэвтэрч орно уу.",
        }
      : {
          title: "Choose Avatar",
          subtitle: "Select an avatar to save to your profile.",
          back: "← Back",
          saving: "Saving...",
          errorTitle: "Something went wrong",
          loginRequired: "Login required.",
        };
  }, [lang]);

  const [token, setToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState("");

  // ✅ your avatar paths (make sure these exist in /public/avatars/)
  const avatars = [
    "/avatars/1.jpg",
    "/avatars/2.jpg",
    "/avatars/3.jpg",
    "/avatars/4.jpg",
    "/avatars/5.jpg",
    "/avatars/6.jpg",
    "/avatars/7.jpg",
    "/avatars/8.jpg",
    "/avatars/9.jpg",
    "/avatars/10.jpg",
  ];

  useEffect(() => {
    const tk = localStorage.getItem("token");
    if (!tk) {
      router.push("/login");
      return;
    }
    setToken(tk);
  }, [router]);

  // ✅ tries multiple endpoints + multiple body keys to match your backend
  const tryUpdateAvatar = async (avatarPath) => {
    const endpoints = [
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/avatar`, // common for profile systems
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/avatar`,     // your old one
    ];

    const bodies = [{ avatar: avatarPath }, { avatarUrl: avatarPath }];

    let lastError = "Unknown error";

    for (const url of endpoints) {
      for (const body of bodies) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          const data = await res.json().catch(() => ({}));

          if (res.ok) return { ok: true, data };

          // keep the most useful message
          lastError = data?.message || data?.error || `Request failed (${res.status})`;

          // if endpoint doesn't exist, try next
          if (res.status === 404) continue;

          // if unauthorized, stop early
          if (res.status === 401) return { ok: false, message: "Unauthorized (401)" };

          // otherwise keep trying other body formats
        } catch (e) {
          lastError = e?.message || "Network error";
        }
      }
    }

    return { ok: false, message: lastError };
  };

  const selectAvatar = async (avatarPath) => {
    if (!token) return setErr(t.loginRequired);

    setErr("");
    setSaving(true);
    setSelected(avatarPath);

    const result = await tryUpdateAvatar(avatarPath);

    setSaving(false);

    if (result.ok) {
      // ✅ Your navbar fetches avatar from /api/profiles/current,
      // so localStorage isn't needed. Just go back and refresh.
      router.push("/account");
      router.refresh?.();
    } else {
      setErr(result.message || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-20 pb-10 max-w-3xl mx-auto">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{t.title}</h1>
          <p className="mt-1 text-white/70 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        <button
          onClick={() => router.back()}
          className="shrink-0 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold"
        >
          {t.back}
        </button>
      </div>

      {/* error */}
      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="font-bold text-red-200">{t.errorTitle}</div>
          <div className="text-red-100/90 text-sm mt-1 break-words">{err}</div>
        </div>
      )}

      {/* grid */}
      <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
        {avatars.map((a) => {
          const isActive = selected === a;
          return (
            <button
              key={a}
              onClick={() => selectAvatar(a)}
              disabled={saving}
              className={[
                "relative rounded-2xl overflow-hidden border transition",
                "bg-white/5 border-white/10 hover:border-white/25",
                saving ? "opacity-70" : "",
                isActive ? "ring-2 ring-blue-500 border-white/40" : "",
              ].join(" ")}
            >
              <img src={a} alt="avatar" className="w-full aspect-square object-cover" />

              {/* selected badge */}
              {isActive && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="w-full text-center text-xs font-extrabold px-3 py-1.5 rounded-full bg-blue-600/90 border border-blue-400/30">
                    {saving ? t.saving : "Selected"}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* small hint */}
      <div className="mt-6 text-white/50 text-xs leading-relaxed">
        Tip: Your avatar images must be inside{" "}
        <span className="text-white/70 font-semibold">/public/avatars/</span>.
      </div>
    </div>
  );
}

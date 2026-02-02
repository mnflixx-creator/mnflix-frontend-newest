"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const t = useMemo(() => {
    const dict = {
      mn: {
        title: "Нууц үг солих",
        desc: "Одоогийн нууц үгээ оруулаад шинэ нууц үгээ тохируулна уу.",
        current: "Одоогийн нууц үг",
        next: "Шинэ нууц үг",
        confirm: "Шинэ нууц үг давтах",
        save: "Солих",
        back: "Буцах",
        mismatch: "Шинэ нууц үг таарахгүй байна.",
        tooShort: "Нууц үг хамгийн багадаа 6 тэмдэгт байна.",
        success: "✅ Амжилттай солигдлоо!",
        error: "Алдаа гарлаа. Дахин оролдоно уу.",
        login: "Нэвтрэх",
      },
      en: {
        title: "Change Password",
        desc: "Enter your current password and set a new one.",
        current: "Current password",
        next: "New password",
        confirm: "Confirm new password",
        save: "Update",
        back: "Back",
        mismatch: "New passwords do not match.",
        tooShort: "Password must be at least 6 characters.",
        success: "✅ Password updated!",
        error: "Something went wrong. Please try again.",
        login: "Login",
      },
    };
    return dict[lang] || dict.mn;
  }, [lang]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (newPassword.length < 6) return setMsg(t.tooShort);
    if (newPassword !== confirmPassword) return setMsg(t.mismatch);

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    setSaving(true);

    // ✅ Try common backend endpoints (use the one you already have)
    const endpoints = [
      "http://localhost:4000/api/auth/change-password",
      "http://localhost:4000/api/account/change-password",
      "http://localhost:4000/api/users/change-password",
    ];

    let ok = false;
    let lastMessage = "";

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          ok = true;
          break;
        } else {
          lastMessage = data.message || "";
          // If endpoint doesn't exist, try the next one
          if (res.status === 404) continue;
          // Other errors (wrong current password, validation, etc.) -> stop
          if (res.status !== 404) break;
        }
      } catch (err) {
        // server down etc.
      }
    }

    setSaving(false);

    if (ok) {
      setMsg(t.success);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/account"), 900);
    } else {
      setMsg(lastMessage || t.error);
    }
  };

  if (loading) return <p className="text-white px-6 mt-20">Loading…</p>;

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-24 pb-10 max-w-xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">{t.title}</h1>
        <p className="text-white/70 text-sm mt-1">{t.desc}</p>
      </div>

      <form
        onSubmit={submit}
        className="bg-[#111] border border-white/10 rounded-2xl p-4"
      >
        <label className="block text-sm text-white/70 mb-1">{t.current}</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
          placeholder="••••••••"
          required
        />

        <div className="h-3" />

        <label className="block text-sm text-white/70 mb-1">{t.next}</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
          placeholder="••••••••"
          required
        />

        <div className="h-3" />

        <label className="block text-sm text-white/70 mb-1">{t.confirm}</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
          placeholder="••••••••"
          required
        />

        {msg && (
          <div
            className={[
              "mt-4 text-sm rounded-xl border p-3",
              msg.includes("✅")
                ? "border-green-500/20 bg-green-500/10 text-green-300"
                : "border-red-500/20 bg-red-500/10 text-red-300",
            ].join(" ")}
          >
            {msg}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3">
          <button
            type="submit"
            disabled={saving}
            className={[
              "mnflix-continue-btn !w-full !py-3 !rounded-xl",
              saving ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {saving ? "..." : t.save}
          </button>

          <button
            type="button"
            onClick={() => router.push("/account")}
            className="w-full py-3 rounded-xl font-bold bg-white/10 hover:bg-white/15 border border-white/10 transition"
          >
            {t.back}
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ read localStorage only on client
  useEffect(() => {
    const e = localStorage.getItem("reset_email") || "";
    const o = localStorage.getItem("reset_otp") || "";
    setEmail(e);
    setOtp(o);

    // optional safety: if missing, send user back
    if (!e || !o) router.push("/forgot-password");
  }, [router]);

  const handleReset = async () => {
    if (!password) return setMsg("Шинэ нууц үгээ оруулна уу");

    setLoading(true);
    setMsg("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      }
    );

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      localStorage.removeItem("reset_email");
      localStorage.removeItem("reset_otp");
      router.push("/login");
    } else {
      setMsg(data.message || "Error");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      {/* ⭐ LOGO */}
      <div className="absolute top-0 left-0 w-full z-50 bg-white">
        <div className="w-full border-b border-gray-300 h-[1px]"></div>
        <div className="w-full flex items-center justify-between px-[223px] py-1 -mt-14 max-w-[1800px] mx-auto">
          <img
            src="/logo.png"
            className="h-50 cursor-pointer object-contain"
            onClick={() => router.push("/")}
            alt="MNFLIX"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-40 px-6">
        <div className="bg-black/70 p-8 rounded-lg max-w-sm w-full text-white backdrop-blur-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Шинэ нууц үг</h1>

          <input
            type="password"
            placeholder="Шинэ нууц үг"
            className="w-full p-3 rounded bg-white/10 mb-4 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold flex justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Нууц үг шинэчлэх"
            )}
          </button>

          {msg && <p className="mt-4 text-red-400 text-center">{msg}</p>}
        </div>
      </div>
    </div>
  );
}

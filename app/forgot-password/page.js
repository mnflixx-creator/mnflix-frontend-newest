"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  // cooldown
  const [cooldown, setCooldown] = useState(0); // seconds left
  const [loading, setLoading] = useState(false);

  // tick cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // helper: try to extract seconds from backend 429 message
  const extractSeconds = (text) => {
    if (!text) return 0;
    const m = String(text).match(/(\d+)\s*секунд/i);
    return m ? Number(m[1]) : 0;
  };

  const sendOtp = async (e) => {
    e?.preventDefault?.();

    if (!email) return setMsg("Email хаягаа оруулна уу");

    try {
      setLoading(true);
      setMsg("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // success
        localStorage.setItem("reset_email", email);
        router.push(`/forgot-password/reset`);
        return;
      }

      // 429 = cooldown active (your backend does this)
      if (res.status === 429) {
        const seconds = extractSeconds(data.message) || 60;
        setCooldown(seconds);
      }

      setMsg(data.message || "Алдаа гарлаа.");
    } catch (err) {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* TOP BAR */}
      <div className="absolute top-0 left-0 w-full z-50 bg-white">
        <div className="w-full border-b border-gray-300 h-[1px]"></div>

        <div
          className="
            w-full flex items-center justify-between
            max-w-[1800px] mx-auto
            px-4 sm:px-8 lg:px-[223px]
            py-2
            mt-0 lg:-mt-14
          "
        >
          <img
            src="/logo.png"
            alt="MNFLIX"
            className="h-50 sm:h-14 lg:h-50 -mt-14 sm:mt-0 lg:mt-0 cursor-pointer object-contain"
            onClick={() => router.push("/")}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex justify-center items-center pt-60 sm:pt-32 lg:pt-52 px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-2">
            Password Reset
          </h1>

          <p className="text-sm sm:text-base text-center text-gray-700 mb-5 sm:mb-6">
            Enter your email and we will send you a verification code.
          </p>

          <form onSubmit={sendOtp}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 outline-none
                        focus:ring-2 focus:ring-blue-500 bg-white text-black"
            />

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className={`w-full text-white py-3 rounded-lg font-semibold transition
                ${loading || cooldown > 0 ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading
                ? "Sending..."
                : cooldown > 0
                ? `Wait ${cooldown}s`
                : "Send Code"}
            </button>
          </form>

          {/* ✅ RESEND BUTTON + COOLDOWN */}
          <button
            onClick={sendOtp}
            disabled={loading || cooldown > 0}
            className={`w-full mt-3 py-3 rounded-lg font-semibold transition border
              ${loading || cooldown > 0
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-200 hover:bg-blue-50"}`}
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend OTP"}
          </button>

          {msg && <p className="text-red-500 text-center mt-3">{msg}</p>}

          <button
            onClick={() => router.push("/login")}
            className="w-full text-center text-blue-600 mt-5 sm:mt-6 hover:underline text-sm sm:text-base"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("reset_email") || ""
      : "";
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // -----------------------------------
  // ⭐ RESEND OTP
  // -----------------------------------
  const resendOtp = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/send-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();
    setResendMsg(data.message || "Код дахин илгээгдлээ");
    setTimeout(() => setResendMsg(""), 3000);
  };

  // -----------------------------------
  // ⭐ RESET PASSWORD
  // -----------------------------------
  const resetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      return setMsg("Бүх талбар шаардлагатай");
    }

    if (newPassword !== confirmPassword) {
      return setMsg("Нууц үг таарахгүй байна");
    }

    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/login");
    } else {
      setMsg(data.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* ⭐ EXACT SAME TOP BAR AS REGISTER PAGE ⭐ */}
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

      {/* ⭐ RESET CARD */}
      <div className="flex justify-center items-center pt-60 sm:pt-52 px-4 pb-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Нууц үг шинэчлэх
          </h1>

          <p className="text-center text-gray-700 mb-2">
            Таны <span className="font-semibold">{email}</span> хаяг руу
            баталгаажуулах код илгээгдлээ.
          </p>

          <p className="text-center text-gray-500 text-sm mb-6">
            Имэйлээ шалгаад доорх кодыг оруулна уу.
          </p>

          {/* FORM */}
          <form onSubmit={resetPassword}>
            {/* OTP FIELD */}
            <input
              type="text"
              placeholder="Баталгаажуулах код"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 outline-none 
                         focus:ring-2 focus:ring-blue-500 bg-white text-black"
            />

            {/* PASSWORD FIELD */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Шинэ нууц үг"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg outline-none 
                           focus:ring-2 focus:ring-blue-500 bg-white text-black"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            <div className="relative mb-4">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Нууц үг давтах"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded-lg outline-none 
                           focus:ring-2 focus:ring-blue-500 bg-white text-black"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 
                         text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Нууц үг шинэчлэх"
              )}
            </button>
          </form>

          {msg && <p className="text-red-500 text-center mt-3">{msg}</p>}
          {resendMsg && (
            <p className="text-green-600 text-center mt-3">{resendMsg}</p>
          )}

          <button
            onClick={resendOtp}
            className="w-full text-center text-blue-600 mt-4 hover:underline"
          >
            Код дахин илгээх
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full text-center text-blue-600 mt-4 hover:underline"
          >
            Нэвтрэх хэсэг рүү буцах
          </button>
        </div>
      </div>
    </div>
  );
}

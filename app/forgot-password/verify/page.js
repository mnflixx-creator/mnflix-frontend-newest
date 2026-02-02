"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const email = typeof window !== "undefined" ? localStorage.getItem("reset_email") : "";

  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleNext = () => {
    if (!otp) return setMsg("Кодыг оруулна уу");

    localStorage.setItem("reset_otp", otp);
    router.push("/forgot/new-password");
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
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-40 px-6">
        <div className="bg-black/70 p-8 rounded-lg max-w-sm w-full text-white backdrop-blur-lg">
          
          <h1 className="text-2xl font-bold mb-4 text-center">Баталгаажуулах код</h1>

          <p className="text-center mb-4 text-gray-300">
            {email} хаяг руу илгээгдсэн кодыг оруулна уу.
          </p>

          <input
            type="text"
            placeholder="4 оронтой код"
            className="w-full p-3 rounded bg-white/10 mb-4 outline-none"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
          >
            Үргэлжлүүлэх
          </button>

          {msg && <p className="mt-4 text-red-400 text-center">{msg}</p>}

        </div>
      </div>
    </div>
  );
}

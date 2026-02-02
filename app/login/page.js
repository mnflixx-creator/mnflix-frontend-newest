"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) return setMsg("Имэйл шаардлагатай.");
    if (!password) return setMsg("Нууц үг шаардлагатай.");

    setLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      setLoading(false);
      return setMsg("API URL тохируулагдаагүй байна.");
    }

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("subscriptionActive", data.user.subscriptionActive);
      router.push("/profiles");
    } else {
      setMsg(data.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      ></div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* ⭐ LOGO BAR */}
      <div className="absolute top-0 left-0 w-full z-50 bg-transparent">
        <div className="w-full border-b border-gray-500/40 h-[1px]"></div>

        <div className="w-full max-w-[1800px] mx-auto flex items-start justify-between px-4 sm:px-8 lg:px-[223px] pt-6.5">
          <img
            src="/logo.png"
            alt="MNFLIX"
            className="h-50 -mt-19 sm:-mt-4 lg:-mt-19 cursor-pointer object-contain"
            onClick={() => router.push("/")}
          />
        </div>
      </div>

      {/* LOGIN BOX */}
      <div className="relative z-10 min-h-screen flex items-start sm:items-center justify-center px-4 pt-50 sm:pt-0">
        <div className="bg-black/75 w-full max-w-md rounded-xl p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Нэвтрэх</h1>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Имэйл хаяг"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-zinc-900 text-white rounded outline-none border border-transparent focus:border-blue-500"
            />

            <div className="relative mb-4">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Нууц үг"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 text-white rounded outline-none border border-transparent focus:border-blue-500"
              />

              <span
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-3 cursor-pointer text-gray-300 hover:text-white text-sm"
              >
                {showPass ? "Нуух" : "Харах"}
              </span>
            </div>

            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded text-base sm:text-lg font-semibold"
              disabled={loading}
            >
              {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
            </button>
          </form>

          {msg && <p className="text-red-400 text-sm mt-4">{msg}</p>}

          <div className="mt-4 text-center">
            <button
              className="text-gray-300 hover:underline"
              onClick={() => router.push("/forgot-password")}
            >
              Нууц үг сэргээх
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" className="accent-blue-600" />
            <span>Намайг сана</span>
          </div>

          <div className="mt-6 text-gray-400 text-sm">
            Шинэ хэрэглэгч үү?
            <button
              className="text-white ml-2 hover:underline"
              onClick={() => router.push("/register")}
            >
              Бүртгүүлэх
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

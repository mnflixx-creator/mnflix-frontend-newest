"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("adminToken", data.token);
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError("Cannot connect to backend");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="w-full max-w-sm bg-black/70 rounded-xl p-6 border border-white/10">
        <h1 className="text-2xl font-bold mb-4 text-center text-[#2EA8FF]">
          MNFLIX Admin
        </h1>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full px-3 py-2 rounded bg-black/50 border border-white/20 text-sm outline-none focus:border-[#2EA8FF]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-black/50 border border-white/20 text-sm outline-none focus:border-[#2EA8FF]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-2 px-3 py-2 rounded bg-[#2EA8FF] hover:bg-[#4FB5FF] font-semibold text-sm"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

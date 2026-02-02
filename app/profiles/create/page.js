"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [kids, setKids] = useState(false);
  const [msg, setMsg] = useState("");

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

  const createProfile = async () => {
    if (!name.trim()) {
      setMsg("Профайлын нэрийг оруулна уу.");
      return;
    }
    if (!avatar) {
      setMsg("Аватар сонгоно уу.");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, avatar, kids }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || "Алдаа гарлаа.");
      return;
    }

    router.push("/profiles");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-20">
      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-12">
        Шинэ профайл үүсгэх
      </h1>

      {/* Profile name */}
      <div className="w-full max-w-md mb-10">
        <label className="text-lg text-gray-300">Профайлын нэр</label>
        <input
          type="text"
          className="
            w-full mt-2 px-4 py-3 
            bg-gray-800 border border-gray-600
            rounded-xl text-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Kids toggle */}
      <label className="flex items-center gap-3 mb-14 text-xl">
        <input
          type="checkbox"
          checked={kids}
          onChange={(e) => setKids(e.target.checked)}
          className="w-5 h-5"
        />
        Хүүхдийн профайл уу?
      </label>

      {/* Avatar section */}
      <h2 className="text-3xl font-semibold mb-6">Аватар сонгох</h2>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-8 mb-12">
        {avatars.map((img) => (
          <div
            key={img}
            className={`
              w-32 h-32 rounded-xl overflow-hidden cursor-pointer
              border-2 transition
              ${avatar === img ? "border-blue-500 scale-105" : "border-gray-700"}
            `}
            onClick={() => setAvatar(img)}
          >
            <img
              src={img}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={createProfile}
        className="
          px-12 py-4 bg-blue-600 
          rounded-xl text-2xl font-semibold
          hover:bg-blue-700 transition
        "
      >
        Үүсгэх
      </button>

      {/* Cancel button */}
      <button
        onClick={() => router.push("/profiles")}
        className="mt-8 text-gray-400 hover:text-gray-200 text-lg"
      >
        Болих
      </button>

      {msg && <p className="text-red-400 mt-6 text-lg">{msg}</p>}
    </div>
  );
}

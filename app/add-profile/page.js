"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProfilePage() {
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL;

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

  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [name, setName] = useState("");
  const [kids, setKids] = useState(false);
  const [msg, setMsg] = useState("");

  const handleCreate = async () => {
    if (!name) return setMsg("Профайлын нэрээ оруулна уу");

    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/auth/profile/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        avatar: selectedAvatar,
        kids,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/profiles");
    } else {
      setMsg(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10">
      {/* TITLE */}
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-center">
        Профайл нэмэх
      </h1>

      {/* AVATARS */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {avatars.map((a) => (
          <img
            key={a}
            src={a}
            onClick={() => setSelectedAvatar(a)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg cursor-pointer border-4 object-cover ${
              selectedAvatar === a ? "border-blue-500" : "border-transparent"
            }`}
          />
        ))}
      </div>

      {/* NAME INPUT */}
      <input
        placeholder="Профайлын нэр"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-[380px] px-4 py-3 mb-4 rounded bg-[#111] border border-gray-600 outline-none focus:border-blue-500"
      />

      {/* KIDS CHECKBOX */}
      <label className="flex items-center gap-2 mb-5 sm:mb-6">
        <input
          type="checkbox"
          checked={kids}
          onChange={() => setKids(!kids)}
          className="scale-110"
        />
        <span className="text-gray-300 text-sm sm:text-base">
          Хүүхдийн профайл уу?
        </span>
      </label>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleCreate}
        className="w-full max-w-[380px] py-3 bg-blue-600 hover:bg-blue-700 rounded text-base sm:text-lg font-semibold"
      >
        Үргэлжлүүлэх
      </button>

      {msg && <p className="text-red-500 mt-4 text-sm sm:text-base">{msg}</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilesPage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfiles(data.profiles || []));
  }, []);

  const switchProfile = async (name) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/switch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-16 sm:pt-32 px-4">

      <h1 className="text-3xl sm:text-5xl font-extrabold mb-8 sm:mb-16 text-center">
        Хэн үзэж байна вэ?
      </h1>

      {/* PROFILE + ADD BUTTON container */}
      <div className="w-full max-w-4xl flex flex-wrap justify-center items-start gap-6 sm:gap-12">

        {/* EXISTING PROFILES */}
        {profiles.map((p) => (
          <div
            key={p.name}
            className="text-center cursor-pointer group"
            onClick={() => switchProfile(p.name)}
          >
            {/* Avatar Square */}
            <div
              className="
                w-28 h-28 sm:w-40 sm:h-40
                rounded-lg overflow-hidden
                transition transform group-hover:scale-110
                border border-gray-700
              "
            >
              <img
                src={p.avatar}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="mt-2 sm:mt-3 text-sm sm:text-lg">{p.name}</p>
          </div>
        ))}

        {/* ADD PROFILE BOX */}
        <div
          className="
            w-28 h-28 sm:w-40 sm:h-40
            rounded-lg
            bg-[#111] border border-gray-600
            flex items-center justify-center
            cursor-pointer
            transition transform hover:scale-110
          "
          onClick={() => router.push("/profiles/create")}
        >
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {/* MANAGE BUTTON */}
      <button
        onClick={() => router.push("/profiles/manage")}
        className="
          px-5 sm:px-6 py-2.5 sm:py-3 mt-10 sm:mt-16
          text-base sm:text-lg border border-gray-500
          rounded hover:bg-white hover:text-black
          transition
        "
      >
        Профайл удирдах
      </button>
    </div>
  );
}

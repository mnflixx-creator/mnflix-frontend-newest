"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManageProfilesPage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [isKids, setIsKids] = useState(false);
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

  // LOAD PROFILES
  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfiles(data.profiles || []));
  }, []);

  // WHEN USER CLICK EDIT
  const openEdit = (profile) => {
    setSelectedProfile(profile);
    setNewName(profile.name);
    setNewAvatar(profile.avatar);
    setIsKids(profile.isKids || false);
  };

  // SAVE EDITED PROFILE
  const saveProfile = async () => {
    if (!newName.trim()) return setMsg("Нэр хоосон байна.");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/edit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldName: selectedProfile.name,
        newName,
        avatar: newAvatar,
        isKids,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return setMsg(data.message || "Алдаа гарлаа.");

    // Update UI instantly
    setProfiles((prev) =>
      prev.map((p) =>
        p.name === selectedProfile.name
          ? { ...p, name: newName, avatar: newAvatar, isKids }
          : p
      )
    );

    setSelectedProfile(null); // CLOSE MODAL
  };

  // DELETE PROFILE
  const deleteProfile = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: selectedProfile.name }),
    });

    if (!res.ok) return setMsg("Устгаж чадсангүй.");

    setProfiles((prev) => prev.filter((p) => p.name !== selectedProfile.name));

    setSelectedProfile(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center text-white py-10 sm:py-20 px-4">
      <h1 className="text-3xl sm:text-6xl font-extrabold mb-10 sm:mb-16 text-center">
        Профайлуудыг удирдах
      </h1>

      <div
        className="grid gap-10 sm:gap-14 mb-14 sm:mb-20 w-full max-w-5xl"
        style={{
          display: "grid",
          // ✅ mobile-friendly: wraps automatically, still nice on desktop
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          justifyContent: "center",
          justifyItems: "center",
        }}
      >
        {profiles.map((p) => (
          <div
            key={p.name}
            className="cursor-pointer flex flex-col items-center group text-center"
            onClick={() => openEdit(p)}
          >
            <div className="relative">
              <img
                src={p.avatar}
                className="
                  w-32 h-32 sm:w-48 sm:h-48
                  rounded-xl object-cover
                  grayscale group-hover:grayscale-0
                  opacity-70 group-hover:opacity-100
                  transition-all
                "
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="
                    w-10 h-10 sm:w-14 sm:h-14
                    text-white opacity-80
                    group-hover:opacity-100
                    transition
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"
                  />
                </svg>
              </div>
            </div>

            <p className="text-base sm:text-xl mt-3 sm:mt-4 text-gray-300 group-hover:text-white">
              {p.name}
            </p>
          </div>
        ))}
      </div>

      {/* DONE */}
      <button
        className="px-8 py-3 sm:px-10 sm:py-4 text-lg sm:text-xl bg-white text-black rounded hover:bg-gray-200 transition"
        onClick={() => router.push("/profiles")}
      >
        Дуусгах
      </button>

      {/* ====================== */}
      {/* 🔥 EDIT MODAL SECTION */}
      {/* ====================== */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 p-6 sm:p-10 rounded-xl w-[90%] max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">
              Профайл засах
            </h2>

            <img
              src={newAvatar}
              className="w-28 h-28 sm:w-40 sm:h-40 rounded-xl mx-auto mb-5 sm:mb-6 object-cover"
            />

            <label className="text-gray-300">Нэр</label>
            <input
              className="w-full mt-2 p-3 bg-gray-800 border border-gray-600 rounded"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <label className="flex items-center gap-3 mt-5 sm:mt-6 text-base sm:text-lg">
              <input
                type="checkbox"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
              />
              Хүүхдийн профайл
            </label>

            <h3 className="text-lg sm:text-xl mt-5 sm:mt-6 mb-2">Аватар сонгох</h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {avatars.map((a) => (
                <img
                  key={a}
                  src={a}
                  onClick={() => setNewAvatar(a)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg cursor-pointer ${
                    newAvatar === a ? "ring-4 ring-blue-400" : ""
                  }`}
                />
              ))}
            </div>

            {msg && <p className="text-red-400 mt-3">{msg}</p>}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between mt-8 sm:mt-10">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-6 py-3 bg-gray-600 rounded hover:bg-gray-700"
              >
                Болих
              </button>

              <button
                onClick={deleteProfile}
                className="px-6 py-3 bg-red-600 rounded hover:bg-red-700"
              >
                Устгах
              </button>

              <button
                onClick={saveProfile}
                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

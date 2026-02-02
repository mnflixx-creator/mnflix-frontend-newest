"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileClient({ name }) {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL; // ✅ changed from localhost:4000

  const [profile, setProfile] = useState(null);
  const [newName, setNewName] = useState("");
  const [isKids, setIsKids] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!token || !name) return;

    fetch(`${API_URL}/api/profiles/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const safeName = name.toLowerCase().trim();

        const found = (data.profiles || []).find(
          (p) => p?.name?.toLowerCase().trim() === safeName
        );

        if (!found) return;

        setProfile(found);
        setNewName(found.name);
        setSelectedAvatar(found.avatar);
        setIsKids(found.isKids || false);
      });
  }, [name, token]);

  const saveProfile = async () => {
    if (!newName.trim()) return setMsg("Профайлын нэр хоосон байна.");

    const res = await fetch(`${API_URL}/api/profiles/edit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldName: name,
        newName,
        avatar: selectedAvatar,
        isKids,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(data.message || "Алдаа гарлаа.");

    router.push("/profiles/manage");
  };

  const deleteProfile = async () => {
    const res = await fetch(`${API_URL}/api/profiles/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (res.ok) router.push("/profiles/manage");
    else setMsg("Профайл устгаж чадсангүй.");
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* your UI here */}
    </div>
  );
}

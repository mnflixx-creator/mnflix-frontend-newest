// ReportProblemButton.jsx
"use client";
import { useState } from "react";

export default function ReportProblemButton({ movieId, movieTitle }) {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "", "sending", "ok", "error"

  if (!movieId) return null;

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !message.trim()) return;

    try {
      setStatus("sending");
      const res = await fetch(`${API}/api/movies/${movieId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setMessage("");
      setTimeout(() => setOpen(false), 800);
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className="inline-block">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-full text-xs sm:text-sm bg-white/10 hover:bg-white/20 border border-white/20"
        >
          ⚠ Алдаа мэдээлэх
        </button>
      ) : (
        <div className="max-w-md rounded-xl border border-white/15 bg-black/80 p-3 space-y-2">
          <div className="text-xs text-white/70">
            {`“${movieTitle}” киноны алдааг тайлбарлаарай.`}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full text-sm bg-black/60 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2EA8FF]"
            placeholder="Жишээ нь: хадмал алдаатай, тоглогдохгүй, дуу зөрж байна гэх мэт..."
          />
          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              Болих
            </button>
            <button
              onClick={submit}
              disabled={status === "sending" || !message.trim()}
              className="px-3 py-1 rounded-lg bg-[#2EA8FF] hover:bg-[#4FB5FF] text-black font-semibold disabled:opacity-50"
            >
              {status === "sending" ? "Илгээж байна…" : "Илгээх"}
            </button>
          </div>
          {status === "ok" && (
            <div className="text-[11px] text-green-400 mt-1">
              Мэдээлэл хүлээн авлаа. Баярлалаа.
            </div>
          )}
          {status === "error" && (
            <div className="text-[11px] text-red-400 mt-1">
              Алдаа гарлаа. Дараа дахин оролдоно уу.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

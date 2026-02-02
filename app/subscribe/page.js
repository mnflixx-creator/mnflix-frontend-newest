"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function SubscribePage() {
  const router = useRouter();
  const { lang } = useLanguage(); // ✅ use global lang from navbar

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const t = useMemo(() => {
    const dict = {
      mn: {
        title: "MNFLIX-ийн эрх сунгах",
        subtitle: "Нэг удаа төлөөд дэлхий дээрх бүх кино, цуврал, анине, шоу бүгдийн үзээрэй",
        choose: "Хугацаагаа сонго",
        discount: "Хямдрал",
        monthlyLabel: "сараар",
        continue: "Үргэлжлүүлэх",
        payTitle: "Гүйлгээ шалгах",
        payDesc:
          "Доорх данс руу сонгосон дүнгээ алдаагүй оруулаад, “Гүйлгээний утга” дээр доорх кодыг хуулж тавиарай. Гүйлгээ хийчихээд Гүйлгээ шалгах товчин дээр дараарай.",
        account: "Данс",
        amount: "Төлөх дүн",
        code: "Код (тайлбарт бичнэ)",
        copy: "Хуулах",
        copied: "Хуулсан",
        checking: "Шалгаж байна…",
        confirmBtn: "Гүйлгээ шалгах",
        notFound:
          "Одоохондоо олдсонгүй. Гүйлгээ хийснээс хойш 10–60 секунд хүлээгээд дахин оролдоорой. Хэрвээ та гүйлгээний утга болон үнийн дүнг буруу оруулсан бол ФБ хуудасаар дамжуулж админтай холбогдоорой",
        success: "✅ Амжилттай! Эрх идэвхжлээ.",
        back: "Буцах",
      },
      en: {
        title: "MNFLIX Subscription",
        subtitle: "Pay once — watch everything with full access",
        choose: "Choose duration",
        discount: "Discount",
        monthlyLabel: "/month",
        continue: "Continue",
        payTitle: "Pay by bank transfer",
        payDesc:
          'Transfer the exact amount (or higher) to the account below, then paste the code into the transfer "description/note".',
        account: "Account",
        amount: "Amount",
        code: "Code (paste into description)",
        copy: "Copy",
        copied: "Copied",
        checking: "Checking…",
        confirmBtn: "Transfer made",
        notFound:
          "Not found yet. After transfer, wait 10–60 seconds and try again.",
        success: "✅ Success! Subscription activated.",
        back: "Back",
      },
    };
    return dict[lang] || dict.mn;
  }, [lang]);

  const plans = useMemo(() => {
    return [
      { months: 1, discount: 0, finalPrice: 9900, monthly: 9900, tag: null, anim: "basic" },
      { months: 2, discount: 10, finalPrice: 17800, monthly: 8900, tag: "popular", anim: "popular" },
      { months: 3, discount: 20, finalPrice: 23700, monthly: 7900, tag: "smart", anim: "smart" },
      { months: 6, discount: 35, finalPrice: 38600, monthly: 6400, tag: "save", anim: "save" },
      { months: 12, discount: 50, finalPrice: 59400, monthly: 4950, tag: "best", anim: "best" },
    ];
  }, []);

  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1); // 1 choose, 2 bank details
  const [selectedMonths, setSelectedMonths] = useState(null);
  const [intent, setIntent] = useState(null);

  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const [copyState, setCopyState] = useState({ account: false, amount: false, code: false });
  const [animTick, setAnimTick] = useState(0);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.months === selectedMonths) || null,
    [plans, selectedMonths]
  );

  const formatMNT = (n) =>
    new Intl.NumberFormat("mn-MN").format(Number(n || 0)) + "₮";

  const copyText = async (key, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopyState((p) => ({ ...p, [key]: true }));
      setTimeout(() => setCopyState((p) => ({ ...p, [key]: false })), 1200);
    } catch {}
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const goToPayment = async () => {
    if (!selectedPlan) return;

    setMessage("");
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/subscription/bank/intent`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Server error");
      return;
    }

    setIntent(data);
    setStep(2);
  };

  const confirmPayment = async () => {
    if (!selectedPlan) return;

    setMessage("");
    setChecking(true);

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/subscription/bank/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ months: selectedPlan.months }),
    });

    const data = await res.json();
    setChecking(false);

    if (res.ok && data?.found && data?.subscribed) {
      setMessage(t.success);
      setTimeout(() => router.push("/home"), 1200);
    } else {
      setMessage(t.notFound);
    }
  };

  if (loading) {
    return <p className="px-4 pt-0 md:pt-24 text-white">Loading…</p>;
  }

  const getTag = (p) => {
    if (lang === "mn") {
      if (p.tag === "popular") return "ИХ СОНГОДОГ";
      if (p.tag === "smart") return "УХААЛАГ СОНГОЛТ";
      if (p.tag === "save") return "ИХ ХЭМНЭЛТ";
      if (p.tag === "best") return "ХАМГИЙН АШИГТАЙ";
      return null;
    } else {
      if (p.tag === "popular") return "POPULAR";
      if (p.tag === "smart") return "SMART PICK";
      if (p.tag === "save") return "BIG SAVE";
      if (p.tag === "best") return "BEST VALUE";
      return null;
    }
  };

  const tagClass = (p) => {
    if (p.tag === "best") return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-orange-500/40";
    if (p.tag === "smart") return "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-emerald-500/40";
    if (p.tag === "popular") return "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-red-500/40";
    if (p.tag === "save") return "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-fuchsia-500/40";
    return "";
  };

  const animClass = (p) => {
    if (p.anim === "basic") return "mnflix-anim-basic";
    if (p.anim === "popular") return "mnflix-anim-popular";
    if (p.anim === "smart") return "mnflix-anim-smart";
    if (p.anim === "save") return "mnflix-anim-save";
    if (p.anim === "best") return "mnflix-anim-best";
    return "";
  };

  return (
    <div className="text-white max-w-4xl mx-auto px-4 pt-0 md:pt-24 pb-24 md:pb-10 md:px-6">
      {/* Title (mobile nicer) */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
        {t.title}
      </h1>
      <p className="mt-2 text-white/70 text-sm md:text-base">
        {t.subtitle}
      </p>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h2 className="mt-6 md:mt-8 text-lg md:text-xl font-semibold">
            {t.choose}
          </h2>

          {/* cards */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {plans.map((p) => {
              const isActive = p.months === selectedMonths;
              const tag = getTag(p);

              return (
                <button
                  key={p.months}
                  onClick={() => {
                    setSelectedMonths(p.months);
                    setAnimTick((x) => x + 1);
                  }}
                  className={[
                    "relative overflow-hidden text-left rounded-2xl border transition",
                    "p-4 md:p-5",
                    "bg-black/30 border-white/10 hover:bg-white/5",
                    isActive ? "border-white/40 bg-white/10" : "",
                    isActive ? `${animClass(p)}-${animTick}`.replace(" ", "") : "",
                  ].join(" ")}
                >
                  <div className={isActive ? animClass(p) : ""} />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base md:text-lg font-bold">
                        {p.months} {lang === "mn" ? "сараар" : (p.months === 1 ? "month" : "months")}
                      </div>

                      <div className="text-white/70 mt-1 text-sm">
                        {t.discount}:{" "}
                        <span className="text-white font-semibold">{p.discount}%</span>
                      </div>
                    </div>

                    {tag && (
                      <span className={["text-[11px] md:text-xs font-extrabold px-3 py-1 rounded-full tracking-wide shadow-md", tagClass(p)].join(" ")}>
                        {tag}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 md:mt-5">
                    <div className="text-2xl md:text-3xl font-extrabold">
                      {formatMNT(p.finalPrice)}
                    </div>
                    <div className="text-white/60 text-xs md:text-sm">
                      {formatMNT(p.monthly)} {t.monthlyLabel}
                    </div>
                  </div>

                  {isActive && <div className="mnflix-selected-ring" />}
                </button>
              );
            })}
          </div>

          {/* Continue (better on mobile: sticky) */}
          {selectedPlan && (
            <div className="mnflix-continue-wrap sticky bottom-4 z-40 mt-5">
              <button onClick={goToPayment} className="mnflix-continue-btn w-full">
                {t.continue} • {formatMNT(selectedPlan.finalPrice)}
              </button>
            </div>
          )}

          {message && (
            <p className="mt-4 text-center text-red-400 text-sm">{message}</p>
          )}
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="mt-6 md:mt-8 bg-black/30 p-4 md:p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-bold">{t.payTitle}</h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs md:text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            >
              {t.back}
            </button>
          </div>

          <p className="mt-2 text-white/70 text-sm md:text-base">{t.payDesc}</p>

          <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-white/60 text-sm">{t.account}</div>

              <div className="text-base md:text-lg font-bold mt-1 break-words">
                {intent?.bankName || "Golomt Bank"} • {intent?.accountNumber || "—"}
              </div>

              <div className="text-white/60 mt-1 text-sm">{intent?.accountName || ""}</div>

              <button
                onClick={() => copyText("account", intent?.accountNumber || "")}
                className="mt-3 w-full md:w-auto px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
              >
                {copyState.account ? t.copied : t.copy}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-white/60 text-sm">{t.amount}</div>
              <div className="text-2xl md:text-3xl font-extrabold mt-1">
                {formatMNT(selectedPlan?.finalPrice || 0)}
              </div>
              <button
                onClick={() => copyText("amount", selectedPlan?.finalPrice || 0)}
                className="mt-3 w-full md:w-auto px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
              >
                {copyState.amount ? t.copied : t.copy}
              </button>
            </div>

            <div className="md:col-span-2 p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-white/60 text-sm mb-2">{t.code}</div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-2xl md:text-3xl font-extrabold tracking-wider break-all">
                  {intent?.code || "—"}
                </div>

                <button
                  onClick={() => copyText("code", intent?.code || "")}
                  className="w-full md:w-auto px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 font-semibold"
                >
                  {copyState.code ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>

          <div className="mnflix-continue-wrap mt-5 md:mt-6">
            <button
              onClick={confirmPayment}
              disabled={checking}
              className={[
                "mnflix-continue-btn w-full",
                checking ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {checking ? t.checking : t.confirmBtn}
              {!checking && selectedPlan && (
                <span className="ml-2 opacity-80">
                  • {formatMNT(selectedPlan.finalPrice)}
                </span>
              )}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-green-400 text-base md:text-lg">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [lang, setLang] = useState("mn");

  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ Terms states (OPTIONAL viewing, REQUIRED acceptance)
  const [termsOpen, setTermsOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const TERMS_TEXT = {
    mn: `
MNFLIX — Үйлчилгээний Нөхцөл

Сүүлд шинэчилсэн: ${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, "0")}.${String(
      new Date().getDate()
    ).padStart(2, "0")}

1. Ерөнхий
MNFLIX нь хэрэглэгчдэд гуравдагч этгээдийн нийтэд байршуулсан контентын холбоос, тоглуулагч (embed) мэдээллийг нэг дор цэгцтэй байдлаар үзүүлэх платформ юм.

2. Агуулгын өмчлөл
MNFLIX нь кино, цуврал, зураг, постер, баннер, видео бичлэгүүдийн зохиогчийн эрхийг эзэмшдэггүй. MNFLIX нь хэрэглэгчдэд гуравдагч этгээдийн эх сурвалж дахь холбоосыг харуулах боломж олгодог.

3. Гуравдагч этгээдийн үйлчилгээ
MNFLIX дээрх тоглуулагч/холбоосууд нь гуравдагч этгээдийн үйлчилгээ байж болно. Тэдний хүртээмж, чанар, тасалдал, алдаа, контентын хууль ёсны байдалд MNFLIX хариуцлага хүлээхгүй.

4. Хэрэглэгчийн хариуцлага
Хэрэглэгч нь MNFLIX-ийг ашиглахдаа өөрийн орны хууль тогтоомжийг дагаж мөрдөх үүрэгтэй. MNFLIX нь хэрэглэгчийн буруутай ашиглалтаас үүсэх аливаа эрсдэлийг хариуцахгүй.

5. Захиалга ба төлбөр
- Төлбөр төлсөнөөр тухайн хугацаанд платформын зарим боломжийг ашиглах эрх нээгдэнэ.
- Төлбөр буцаан олголтгүй (refundable биш) бөгөөд гүйцэтгэсэн төлбөрийг буцаахгүй.
- Гуравдагч этгээдийн төлбөрийн үйлчилгээ (банк, карт, төлбөрийн шлюз) дээрх алдаа/сааталд MNFLIX шууд хариуцлага хүлээхгүй.

6. Үйлчилгээний өөрчлөлт
MNFLIX нь функц, үнэ, дүрэм, боломжуудыг хүссэн үедээ өөрчлөх, түр зогсоох, сайжруулах эрхтэй.

7. Бүртгэл ба аюулгүй байдал
Та өөрийн нууц үг, бүртгэлийн мэдээллээ хамгаалах үүрэгтэй. MNFLIX эрхийг тань түр/бүр мөсөн хязгаарлаж болно.

8. Хариуцлагаас татгалзах
MNFLIX нь тасалдалгүй, алдаагүй ажиллана гэж батлахгүй. Контент тоглохгүй байх, холбоос ажиллахгүй байх, төхөөрөмжийн нийцтэй байдлын асуудалд MNFLIX баталгаа өгөхгүй.

9. Холбоо барих
Асуудал, хүсэлт байвал MNFLIX-ийн албан ёсны сувгаар холбогдоно уу.
`,
    en: `
MNFLIX — Terms & Conditions

Last updated: ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
      new Date().getDate()
    ).padStart(2, "0")}

1. General
MNFLIX is a platform that organizes and displays publicly available third-party links and embedded players in a convenient way.

2. Content ownership
MNFLIX does NOT own the movies/series or related media (videos, images, posters, banners). MNFLIX only provides access to third-party links/embeds.

3. Third-party services
Players/links shown on MNFLIX may be provided by third parties. MNFLIX is not responsible for availability, quality, interruptions, errors, or the legality of third-party content.

4. User responsibility
You are responsible for complying with the laws of your country. MNFLIX is not liable for misuse by users.

5. Subscription & payments
- Paying unlocks certain features for the paid period.
- Payments are non-refundable. Completed payments will not be refunded.
- MNFLIX is not directly responsible for delays/errors caused by third-party payment providers (banks, card gateways, etc.).

6. Service changes
MNFLIX may change features, pricing, rules, or availability at any time, including suspending or discontinuing parts of the service.

7. Account & security
You are responsible for protecting your account credentials. MNFLIX may restrict or terminate accounts in case of violations or suspicious activity.

8. Disclaimer
MNFLIX does not guarantee uninterrupted or error-free operation. MNFLIX provides no guarantee that a link/player will work, that content will play, or that a device will be compatible.

9. Contact
For issues or requests, contact MNFLIX through official channels.
`,
  };

  const t = {
    mn: {
      title: "Бүртгэлээ үүсгэнэ үү",
      note: "Үргэлжлүүлэхийн тулд имэйлээ оруулж нууц үгээ үүсгэнэ үү.",
      email: "Имэйл хаяг",
      pass: "Нууц үг үүсгэх",
      confirm: "Нууц үг баталгаажуулах",
      btn: "Үргэлжлүүлэх",
      signIn: "Нэвтрэх",
      errEmail: "Имэйл хаяг шаардлагатай.",
      errPass: "Нууц үг шаардлагатай.",
      errMatch: "Нууц үг таарахгүй байна.",
      mustAgree: "Үйлчилгээний нөхцөлийг зөвшөөрөх шаардлагатай.",
      termsPrefix: "Би ",
      termsLink: "Үйлчилгээний нөхцөлийг",
      termsSuffix: "зөвшөөрч байна.",
      termsTitle: "Үйлчилгээний нөхцөл",
      close: "Хаах",
    },
    en: {
      title: "Create your account",
      note: "Enter your email and create a password to continue.",
      email: "Email address",
      pass: "Create password",
      confirm: "Confirm password",
      btn: "Continue",
      signIn: "Sign In",
      errEmail: "Email is required.",
      errPass: "Password is required.",
      errMatch: "Passwords do not match.",
      mustAgree: "You must accept the Terms & Conditions.",
      termsPrefix: "I have read and agree to the ",
      termsLink: "Terms & Conditions",
      termsSuffix: ".",
      termsTitle: "Terms & Conditions",
      close: "Close",
    },
  }[lang];

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email) return setMsg(t.errEmail);
    if (!password) return setMsg(t.errPass);
    if (password !== confirm) return setMsg(t.errMatch);

    // ✅ REQUIRED: only checkbox acceptance, NOT reading
    if (!agreeTerms) return setMsg(t.mustAgree);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "subscriptionActive",
        data.user.subscriptionActive || false
      );
      router.push("/add-profile");
    } else {
      setMsg(data.message);
    }
  };

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden relative">
      {/* ✅ Terms Modal (only opens if user clicks the terms text) */}
      {termsOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="font-bold text-black">{t.termsTitle}</div>
              <button
                onClick={() => setTermsOpen(false)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-black text-sm"
              >
                {t.close}
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center justify-end mb-3 gap-2">
                <button
                  onClick={() => setLang("mn")}
                  className={`px-3 py-1 rounded text-xs ${
                    lang === "mn"
                      ? "bg-black text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  MN
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 rounded text-xs ${
                    lang === "en"
                      ? "bg-black text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  EN
                </button>
              </div>

              <div className="h-[60vh] overflow-y-auto rounded-xl border border-gray-200 p-4 text-sm text-gray-800 whitespace-pre-wrap">
                {TERMS_TEXT[lang]}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setTermsOpen(false)}
                  className="px-5 py-2 rounded bg-[#2EA8FF] hover:bg-[#4FB5FF] font-semibold text-sm text-white"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Overlay header */}
      <header className="absolute top-0 left-0 w-full z-50">
        <div
          className="
            w-full max-w-[1800px] mx-auto
            flex items-start justify-between
            px-4 sm:px-8 lg:px-[223px]
            pt-6.5
          "
        >
          <img
            src="/logo.png"
            alt="MNFLIX"
            className="h-50 -mt-19 sm:-mt-4 lg:-mt-19 cursor-pointer object-contain"
            onClick={() => router.push("/")}
          />

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => setLang("mn")}
                className={`px-3 py-1 rounded text-sm ${
                  lang === "mn" ? "bg-black text-white" : "bg-gray-200 text-black"
                }`}
              >
                MN
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded text-sm ${
                  lang === "en" ? "bg-black text-white" : "bg-gray-200 text-black"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="px-4 sm:px-5 py-2 rounded bg-[#2EA8FF] hover:bg-[#4FB5FF] font-semibold text-sm text-white"
            >
              {t.signIn}
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Content */}
      <main className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-0">
        <div className="w-full max-w-lg text-center pb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-black">
            {t.title}
          </h2>

          <p className="text-gray-600 mb-6 sm:mb-10 text-sm sm:text-base">
            {t.note}
          </p>

          <form
            onSubmit={handleRegister}
            className="flex flex-col gap-3 sm:gap-4"
          >
            <input
              className="border border-gray-300 rounded px-4 py-2.5 sm:py-3 placeholder:text-gray-500 text-black"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="border border-gray-300 rounded px-4 py-2.5 sm:py-3 placeholder:text-gray-500 text-black"
              placeholder={t.pass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              className="border border-gray-300 rounded px-4 py-2.5 sm:py-3 placeholder:text-gray-500 text-black"
              placeholder={t.confirm}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {/* ✅ Single clickable line:
                - checkbox always clickable
                - "termsLink" opens modal only if clicked */}
            <div className="text-left mt-1">
              <label className="flex items-start gap-3 text-sm text-black select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 mt-1"
                />

                <span className="leading-5">
                  {t.termsPrefix}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="text-[#2EA8FF] font-semibold hover:underline"
                  >
                    {t.termsLink}
                  </button>
                  {t.termsSuffix}
                </span>
              </label>
            </div>

            <button className="mt-3 sm:mt-4 bg-[#2EA8FF] hover:bg-[#4FB5FF] text-white py-2.5 sm:py-3 rounded text-base sm:text-lg font-medium">
              {t.btn}
            </button>
          </form>

          {msg && <p className="text-red-500 mt-3 sm:mt-4">{msg}</p>}
        </div>
      </main>
    </div>
  );
}

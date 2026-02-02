"use client";

import { useEffect, useState } from "react";

async function safeJson(res) {
  const contentType = res.headers.get("content-type") || "";

  // If backend returned HTML (DOCTYPE), don't try res.json()
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    return { __notJson: true, text };
  }

  return await res.json();
}

export default function AdminBankSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [prices, setPrices] = useState([
    { months: 1, amount: 11900 },
    { months: 2, amount: 21400 },
    { months: 3, amount: 28500 },
    { months: 6, amount: 46400 },
    { months: 12, amount: 71400 },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setMsg("Missing adminToken. Please login again.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${API_URL}/api/admin/bank-settings`, {

          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await safeJson(res);

        if (data?.__notJson) {
          // Usually means wrong URL or backend returned HTML 404/login page
          setMsg(
            "Backend did not return JSON. Check your API URL and backend route.\n\n" +
              "Received HTML (first line): " +
              (data.text || "").split("\n")[0]
          );
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to load");
        }

        setBankName(data.bankName || "");
        setAccountNumber(data.accountNumber || "");
        setAccountName(data.accountName || "");
        if (Array.isArray(data.prices) && data.prices.length) setPrices(data.prices);
      } catch (e) {
        setMsg(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateRow = (idx, key, value) => {
    setPrices((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const addRow = () => setPrices((p) => [...p, { months: 1, amount: 1000 }]);
  const removeRow = (idx) => setPrices((p) => p.filter((_, i) => i !== idx));

  const save = async () => {
    setMsg("");
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setMsg("Missing adminToken. Please login again.");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API_URL}/api/admin/bank-settings`, {

      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bankName,
        accountNumber,
        accountName,
        prices,
      }),
    });

    const data = await safeJson(res);

    if (data?.__notJson) {
      setMsg(
        "Backend did not return JSON on save. Check your backend route.\n\n" +
          "Received HTML (first line): " +
          (data.text || "").split("\n")[0]
      );
      return;
    }

    if (!res.ok) {
      setMsg(data.message || "Save failed");
      return;
    }

    setMsg("✅ Saved");
    if (data?.settings?.prices) setPrices(data.settings.prices);
  };

  if (loading) return <div className="text-white">Loading…</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Bank & Pricing</h1>
      <p className="text-gray-400 mb-6">
        Edit bank transfer details and subscription price tiers.
      </p>

      {msg && (
        <div className="mb-4 text-sm px-3 py-2 rounded bg-white/10 border border-white/10 whitespace-pre-wrap">
          {msg}
        </div>
      )}

      <div className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Bank name</div>
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full p-3 rounded bg-white/5 border border-white/10 outline-none"
            placeholder="Golomt Bank"
          />
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Account number</div>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full p-3 rounded bg-white/5 border border-white/10 outline-none"
            placeholder="330*****90"
          />
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Account name</div>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full p-3 rounded bg-white/5 border border-white/10 outline-none"
            placeholder="YOUR NAME"
          />
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Price tiers</div>
              <div className="text-sm text-gray-400">months + amount (MNT)</div>
            </div>
            <button
              onClick={addRow}
              className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-sm"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {prices.map((p, idx) => (
              <div
                key={idx}
                className="flex gap-2 items-center bg-white/5 border border-white/10 rounded-lg p-2"
              >
                <input
                  type="number"
                  value={p.months}
                  onChange={(e) => updateRow(idx, "months", Number(e.target.value))}
                  className="w-28 p-2 rounded bg-black/40 border border-white/10 outline-none"
                  placeholder="months"
                />
                <input
                  type="number"
                  value={p.amount}
                  onChange={(e) => updateRow(idx, "amount", Number(e.target.value))}
                  className="flex-1 p-2 rounded bg-black/40 border border-white/10 outline-none"
                  placeholder="amount"
                />
                <button
                  onClick={() => removeRow(idx)}
                  className="px-3 py-2 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="w-full mt-2 px-4 py-3 rounded bg-[#2EA8FF] text-black font-bold hover:opacity-90"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

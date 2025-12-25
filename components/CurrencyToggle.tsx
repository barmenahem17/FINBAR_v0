"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "finbar_default_currency";

export default function CurrencyToggle() {
  const [currency, setCurrency] = useState<"ILS" | "USD">("ILS");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "ILS") {
      setCurrency(saved);
    }
  }, []);

  function handleChange(newCurrency: "ILS" | "USD") {
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  }

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">מטבע תצוגה ברירת מחדל</h2>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-zinc-100 rounded-xl animate-pulse" />
          <div className="flex-1 h-10 bg-zinc-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">מטבע תצוגה ברירת מחדל</h2>
      <p className="text-sm text-zinc-500 mb-4">
        בחר את המטבע שבו יוצגו הסכומים בדשבורד
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handleChange("ILS")}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currency === "ILS"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          ₪ שקל
        </button>
        <button
          onClick={() => handleChange("USD")}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currency === "USD"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          $ דולר
        </button>
      </div>
    </div>
  );
}


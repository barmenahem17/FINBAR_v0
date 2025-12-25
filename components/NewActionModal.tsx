"use client";

import { useState, useTransition } from "react";
import { Portfolio, TransactionType, Currency } from "../types/database";
import { createTransaction } from "../app/transactions/actions";

interface NewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolios: Portfolio[];
}

const ACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "BUY", label: "קנייה" },
  { value: "SELL", label: "מכירה" },
  { value: "DEPOSIT", label: "הפקדה" },
  { value: "WITHDRAW", label: "משיכה" },
  { value: "CONVERT", label: "המרת מטבע" },
  { value: "DIVIDEND", label: "דיבידנד" },
];

export default function NewActionModal({ isOpen, onClose, portfolios }: NewActionModalProps) {
  const [actionType, setActionType] = useState<TransactionType>("DEPOSIT");
  const [portfolioId, setPortfolioId] = useState<string>(portfolios[0]?.id || "");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [fee, setFee] = useState("");
  const [fxRate, setFxRate] = useState("");
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");
  const [toCurrency, setToCurrency] = useState<Currency>("ILS");
  
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setSymbol("");
    setQuantity("");
    setPrice("");
    setAmount("");
    setFee("");
    setFxRate("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!portfolioId) {
      setError("יש לבחור תיק");
      return;
    }

    startTransition(async () => {
      const result = await createTransaction({
        portfolioId,
        type: actionType,
        symbol: symbol || undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        price: price ? parseFloat(price) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        currency,
        fee: fee ? parseFloat(fee) : undefined,
        fxRate: fxRate ? parseFloat(fxRate) : undefined,
        fromCurrency: actionType === "CONVERT" ? fromCurrency : undefined,
        toCurrency: actionType === "CONVERT" ? toCurrency : undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">פעולה חדשה</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Portfolio selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">תיק</label>
              {portfolios.length === 0 ? (
                <div className="p-3 rounded-xl bg-zinc-100 text-sm text-zinc-500 text-center">
                  אין תיקים. <a href="/settings" className="underline" style={{ color: "#F7931A" }}>צור תיק חדש</a>
                </div>
              ) : (
                <select
                  value={portfolioId}
                  onChange={(e) => setPortfolioId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white"
                  required
                >
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.account_number ? `(${p.account_number})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Action type selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">סוג פעולה</label>
              <div className="grid grid-cols-3 gap-2">
                {ACTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setActionType(type.value);
                      resetForm();
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      actionType === type.value
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic fields based on action type */}
            {(actionType === "BUY" || actionType === "SELL") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סימול (Symbol)</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="לדוגמה: AAPL"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">כמות</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      step="any"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">מחיר ליחידה ($)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      step="any"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">עמלה ($) - אופציונלי</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="ברירת מחדל מהתיק"
                    step="any"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              </>
            )}

            {(actionType === "DEPOSIT" || actionType === "WITHDRAW") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">מטבע</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white"
                  >
                    <option value="ILS">₪ שקל</option>
                    <option value="USD">$ דולר</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סכום</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="any"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              </>
            )}

            {actionType === "CONVERT" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">ממטבע</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value as Currency)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white"
                    >
                      <option value="USD">$ דולר</option>
                      <option value="ILS">₪ שקל</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">למטבע</label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value as Currency)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white"
                    >
                      <option value="ILS">₪ שקל</option>
                      <option value="USD">$ דולר</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סכום להמרה</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="any"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">שער המרה</label>
                  <input
                    type="number"
                    value={fxRate}
                    onChange={(e) => setFxRate(e.target.value)}
                    placeholder="3.65"
                    step="any"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              </>
            )}

            {actionType === "DIVIDEND" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סימול (Symbol)</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="לדוגמה: AAPL"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">מטבע</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white"
                  >
                    <option value="USD">$ דולר</option>
                    <option value="ILS">₪ שקל</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סכום דיבידנד</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="any"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isPending || portfolios.length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#F7931A" }}
              >
                {isPending ? "שומר..." : "שמור פעולה"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

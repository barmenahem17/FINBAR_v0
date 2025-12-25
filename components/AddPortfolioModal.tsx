"use client";

import { useState } from "react";
import { createPortfolio } from "../app/settings/actions";

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPortfolioModal({ isOpen, onClose }: AddPortfolioModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createPortfolio(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">הוספת תיק חדש</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form action={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">שם התיק</label>
              <input
                name="name"
                type="text"
                required
                placeholder="לדוגמה: תיק מניות"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">עמלה ($)</label>
              <input
                name="feeAmount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-500">עמלה קבועה בדולרים לכל פעולת קנייה/מכירה</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">מספר חשבון (אופציונלי)</label>
              <input
                name="accountNumber"
                type="text"
                placeholder="לדוגמה: 12345"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#F7931A" }}
              >
                {loading ? "יוצר תיק..." : "צור תיק"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


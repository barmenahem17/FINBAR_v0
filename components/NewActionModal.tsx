"use client";

import { useState } from "react";

type ActionType = "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW" | "CONVERT" | "DIVIDEND";

interface NewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: "BUY", label: "קנייה" },
  { value: "SELL", label: "מכירה" },
  { value: "DEPOSIT", label: "הפקדה" },
  { value: "WITHDRAW", label: "משיכה" },
  { value: "CONVERT", label: "המרת מטבע" },
  { value: "DIVIDEND", label: "דיבידנד" },
];

export default function NewActionModal({ isOpen, onClose }: NewActionModalProps) {
  const [actionType, setActionType] = useState<ActionType>("BUY");

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
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">פעולה חדשה</h2>
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
          <div className="p-5 space-y-4">
            {/* Action type selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">סוג פעולה</label>
              <div className="grid grid-cols-3 gap-2">
                {ACTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setActionType(type.value)}
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
                    placeholder="לדוגמה: AAPL"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">כמות</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">מחיר ליחידה</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">עמלה (אופציונלי)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              </>
            )}

            {(actionType === "DEPOSIT" || actionType === "WITHDRAW") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">מטבע</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white">
                    <option value="ILS">₪ שקל</option>
                    <option value="USD">$ דולר</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סכום</label>
                  <input
                    type="number"
                    placeholder="0.00"
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
                    <select className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white">
                      <option value="ILS">₪ שקל</option>
                      <option value="USD">$ דולר</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">למטבע</label>
                    <select className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white">
                      <option value="USD">$ דולר</option>
                      <option value="ILS">₪ שקל</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סכום להמרה</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">שער המרה</label>
                  <input
                    type="number"
                    placeholder="3.65"
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
                    placeholder="לדוגמה: AAPL"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">מטבע</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900 bg-white">
                    <option value="USD">$ דולר</option>
                    <option value="ILS">₪ שקל</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">סכום דיבידנד</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-zinc-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              ביטול
            </button>
            <button
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#F7931A" }}
            >
              שמור פעולה
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


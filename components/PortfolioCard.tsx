"use client";

import { useState } from "react";
import { Portfolio } from "../types/database";
import { updatePortfolio, deletePortfolio } from "../app/settings/actions";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("id", portfolio.id);
    
    const result = await updatePortfolio(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setIsEditing(false);
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("id", portfolio.id);
    
    const result = await deletePortfolio(formData);
    
    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
    }
    setLoading(false);
  }

  if (isDeleting) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-4">
        <p className="text-sm text-zinc-700 mb-4">
          האם אתה בטוח שברצונך למחוק את התיק &quot;{portfolio.name}&quot;?
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "מוחק..." : "כן, מחק"}
          </button>
          <button
            onClick={() => setIsDeleting(false)}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
          >
            ביטול
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <form action={handleUpdate} className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">שם התיק</label>
            <input
              name="name"
              type="text"
              defaultValue={portfolio.name}
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">עמלה ($)</label>
              <input
                name="feeAmount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={portfolio.fee_amount || 0}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm outline-none focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">מספר חשבון</label>
              <input
                name="accountNumber"
                type="text"
                defaultValue={portfolio.account_number || ""}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "שומר..." : "שמור"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
          >
            ביטול
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-zinc-900">{portfolio.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
            <span>עמלה: ${portfolio.fee_amount || 0}</span>
            {portfolio.account_number && (
              <>
                <span className="text-zinc-300">|</span>
                <span>חשבון: {portfolio.account_number}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="ערוך"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="מחק"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


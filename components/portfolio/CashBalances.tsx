"use client";

import { Currency } from "../../types/database";
import { formatCurrency } from "../../lib/logic/calculations";
import { convertToDisplayCurrency } from "../../lib/logic/currency";

interface CashBalancesProps {
  balances: { currency: Currency; amount: number }[];
  currency: Currency;
  usdilsRate: number;
}

export default function CashBalances({ balances, currency, usdilsRate }: CashBalancesProps) {
  // Calculate total in display currency
  const totalInDisplayCurrency = balances.reduce((sum, balance) => {
    return sum + convertToDisplayCurrency(balance.amount, balance.currency, currency, usdilsRate);
  }, 0);

  if (balances.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">יתרות מזומנים</h2>
        <div className="text-center py-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm">אין יתרות מזומנים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">יתרות מזומנים</h2>

      <div className="space-y-3">
        {balances.map((balance) => (
          <div
            key={balance.currency}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-sm font-medium">
                {balance.currency === "USD" ? "$" : "₪"}
              </div>
              <span className="text-zinc-700">
                {balance.currency === "USD" ? "דולר" : "שקל"}
              </span>
            </div>
            <span className="font-semibold text-zinc-900">
              {formatCurrency(balance.amount, balance.currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Total in display currency */}
      {balances.length > 1 && (
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">סה״כ ({currency})</span>
            <span className="font-semibold text-zinc-900">
              {formatCurrency(totalInDisplayCurrency, currency)}
            </span>
          </div>
        </div>
      )}

      {/* FX rate info */}
      <div className="mt-4 pt-3 border-t border-zinc-100">
        <p className="text-xs text-zinc-400 text-center">
          שער דולר: ₪{usdilsRate.toFixed(4)}
        </p>
      </div>
    </div>
  );
}


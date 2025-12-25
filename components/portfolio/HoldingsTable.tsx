"use client";

import { Currency } from "../../types/database";
import { HoldingSummary } from "../../lib/logic/aggregation";
import { formatCurrency, formatPercent } from "../../lib/logic/calculations";

interface HoldingsTableProps {
  holdings: HoldingSummary[];
  currency: Currency;
}

export default function HoldingsTable({ holdings, currency }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">החזקות נוכחיות</h2>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="text-zinc-500">אין החזקות בתיק זה</p>
          <p className="text-sm text-zinc-400 mt-1">בצע קנייה כדי להוסיף נכסים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-900">החזקות נוכחיות</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 text-right">
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                סימול
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                כמות
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                עלות ממוצעת
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                מחיר נוכחי
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                שווי שוק
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                רווח/הפסד
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {holdings.map((holding) => {
              const isPositive = holding.unrealizedPL >= 0;

              return (
                <tr key={holding.symbol} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-zinc-900">{holding.symbol}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {holding.quantity.toLocaleString("he-IL", {
                      maximumFractionDigits: 8,
                    })}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {formatCurrency(holding.avgCost, currency)}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {holding.currentPrice > 0
                      ? formatCurrency(holding.currentPrice, currency)
                      : <span className="text-zinc-400">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-zinc-900 font-medium">
                    {formatCurrency(holding.marketValue, currency)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          isPositive ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(holding.unrealizedPL, currency)}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          isPositive
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-red-600 bg-red-50"
                        }`}
                      >
                        {formatPercent(holding.unrealizedPLPercent)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


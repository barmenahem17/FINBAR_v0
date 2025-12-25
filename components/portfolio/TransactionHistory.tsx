"use client";

import { Transaction, Currency, TransactionType } from "../../types/database";
import { formatCurrency } from "../../lib/logic/calculations";

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency: Currency;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  BUY: "קנייה",
  SELL: "מכירה",
  DEPOSIT: "הפקדה",
  WITHDRAW: "משיכה",
  CONVERT: "המרה",
  DIVIDEND: "דיבידנד",
};

const TYPE_COLORS: Record<TransactionType, { bg: string; text: string }> = {
  BUY: { bg: "bg-blue-50", text: "text-blue-700" },
  SELL: { bg: "bg-purple-50", text: "text-purple-700" },
  DEPOSIT: { bg: "bg-emerald-50", text: "text-emerald-700" },
  WITHDRAW: { bg: "bg-orange-50", text: "text-orange-700" },
  CONVERT: { bg: "bg-yellow-50", text: "text-yellow-700" },
  DIVIDEND: { bg: "bg-teal-50", text: "text-teal-700" },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTransactionDetails(tx: Transaction): string {
  const txType = tx.type as TransactionType;
  const txCurrency = tx.currency as Currency;

  switch (txType) {
    case "BUY":
    case "SELL":
      return `${tx.quantity} × ${formatCurrency(tx.price || 0, txCurrency)}`;
    case "DEPOSIT":
    case "WITHDRAW":
    case "DIVIDEND":
      return formatCurrency(tx.amount || 0, txCurrency);
    case "CONVERT":
      return `${formatCurrency(tx.amount || 0, tx.from_currency as Currency)} → ${tx.to_currency}`;
    default:
      return "—";
  }
}

function getTransactionTotal(tx: Transaction): { amount: number; currency: Currency } {
  const txType = tx.type as TransactionType;
  const txCurrency = tx.currency as Currency;
  const fee = tx.fee || 0;

  switch (txType) {
    case "BUY":
      return {
        amount: -((tx.quantity || 0) * (tx.price || 0) + fee),
        currency: txCurrency,
      };
    case "SELL":
      return {
        amount: (tx.quantity || 0) * (tx.price || 0) - fee,
        currency: txCurrency,
      };
    case "DEPOSIT":
    case "DIVIDEND":
      return {
        amount: tx.amount || 0,
        currency: txCurrency,
      };
    case "WITHDRAW":
      return {
        amount: -(tx.amount || 0),
        currency: txCurrency,
      };
    case "CONVERT":
      return {
        amount: -(tx.amount || 0),
        currency: tx.from_currency as Currency,
      };
    default:
      return { amount: 0, currency: txCurrency };
  }
}

export default function TransactionHistory({ transactions, currency }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">היסטוריית פעולות</h2>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-zinc-500">אין היסטוריית פעולות</p>
          <p className="text-sm text-zinc-400 mt-1">הפעולות שתבצע יופיעו כאן</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-900">היסטוריית פעולות</h2>
        <p className="text-sm text-zinc-500 mt-1">{transactions.length} פעולות</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 text-right">
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                תאריך
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                סוג
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                סימול
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                פרטים
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                עמלה
              </th>
              <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                סה״כ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {transactions.map((tx) => {
              const txType = tx.type as TransactionType;
              const colors = TYPE_COLORS[txType];
              const total = getTransactionTotal(tx);

              return (
                <tr key={tx.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-zinc-600">
                    {formatDate(tx.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {TYPE_LABELS[txType]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {tx.symbol ? (
                      <span className="font-medium text-zinc-900">{tx.symbol}</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">
                    {getTransactionDetails(tx)}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {tx.fee && tx.fee > 0 ? (
                      formatCurrency(tx.fee, tx.currency as Currency)
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`font-medium ${
                        total.amount >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(total.amount, total.currency)}
                    </span>
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


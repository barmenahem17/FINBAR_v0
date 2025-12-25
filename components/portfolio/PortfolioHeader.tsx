"use client";

import { Portfolio, Currency } from "../../types/database";
import { PortfolioSummary } from "../../lib/logic/aggregation";
import { formatCurrency, formatPercent } from "../../lib/logic/calculations";

interface PortfolioHeaderProps {
  portfolio: Portfolio;
  summary: PortfolioSummary;
  currency: Currency;
  onCurrencyToggle: () => void;
  onNewAction: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function PortfolioHeader({
  portfolio,
  summary,
  currency,
  onCurrencyToggle,
  onNewAction,
  onRefresh,
  isRefreshing,
}: PortfolioHeaderProps) {
  const isPositive = summary.unrealizedPL >= 0;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Portfolio info */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-zinc-900">{portfolio.name}</h1>
            {portfolio.account_number && (
              <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg">
                {portfolio.account_number}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-6 mt-4">
            {/* Total Value */}
            <div>
              <p className="text-sm text-zinc-500 mb-1">שווי כולל</p>
              <p className="text-2xl font-semibold text-zinc-900">
                {formatCurrency(summary.totalValue, currency)}
              </p>
            </div>

            {/* P/L */}
            <div>
              <p className="text-sm text-zinc-500 mb-1">רווח/הפסד</p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-xl font-semibold ${
                    isPositive ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(summary.unrealizedPL, currency)}
                </p>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded-lg ${
                    isPositive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {formatPercent(summary.unrealizedPLPercent)}
                </span>
              </div>
            </div>

            {/* Holdings vs Cash breakdown */}
            <div>
              <p className="text-sm text-zinc-500 mb-1">נכסים / מזומנים</p>
              <p className="text-lg text-zinc-700">
                {formatCurrency(summary.holdingsValue, currency)}
                <span className="text-zinc-400 mx-1">/</span>
                {formatCurrency(summary.cashValue, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <button
            onClick={onCurrencyToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <span>{currency === "ILS" ? "₪" : "$"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRefreshing ? "מרענן..." : "רענן"}
          </button>

          {/* New Action Button */}
          <button
            onClick={onNewAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#F7931A" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            פעולה חדשה
          </button>
        </div>
      </div>
    </div>
  );
}


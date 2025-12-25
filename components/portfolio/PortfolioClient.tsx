"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Sidebar from "../Sidebar";
import NewActionModal from "../NewActionModal";
import PortfolioHeader from "./PortfolioHeader";
import HoldingsTable from "./HoldingsTable";
import TransactionHistory from "./TransactionHistory";
import CashBalances from "./CashBalances";
import { Portfolio, Currency } from "../../types/database";
import { PortfolioPageData, refreshPortfolioPageData } from "../../app/portfolios/[id]/actions";

const STORAGE_KEY = "finbar_default_currency";

interface PortfolioClientProps {
  portfolios: Portfolio[];
  initialData: PortfolioPageData;
}

export default function PortfolioClient({ portfolios, initialData }: PortfolioClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currency, setCurrency] = useState<Currency>(initialData.displayCurrency);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PortfolioPageData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Load saved currency preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "ILS") {
      setCurrency(saved);
    }
  }, []);

  function handleCurrencyToggle() {
    const newCurrency = currency === "ILS" ? "USD" : "ILS";
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);

    // Refresh data with new currency
    startTransition(async () => {
      const result = await refreshPortfolioPageData(data.portfolio.id, newCurrency);
      if (result.data) {
        setData(result.data);
      }
    });
  }

  function handleRefresh() {
    setRefreshError(null);
    startTransition(async () => {
      const result = await refreshPortfolioPageData(data.portfolio.id, currency);
      if (result.data) {
        setData(result.data);
      } else {
        setRefreshError(result.error || "שגיאה ברענון הנתונים");
      }
    });
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        portfolios={portfolios}
      />

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "mr-64" : "mr-16"
        }`}
      >
        <div className="p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              חזרה לסקירה
            </Link>
          </div>

          {/* Portfolio Header */}
          <PortfolioHeader
            portfolio={data.portfolio}
            summary={data.summary}
            currency={currency}
            onCurrencyToggle={handleCurrencyToggle}
            onNewAction={() => setIsModalOpen(true)}
            onRefresh={handleRefresh}
            isRefreshing={isPending}
          />

          {/* Refresh error */}
          {refreshError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {refreshError}
            </div>
          )}

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Holdings Table - takes 2 columns */}
            <div className="lg:col-span-2">
              <HoldingsTable
                holdings={data.holdings}
                currency={currency}
              />
            </div>

            {/* Cash Balances - takes 1 column */}
            <div>
              <CashBalances
                balances={data.cashBalances}
                currency={currency}
                usdilsRate={data.usdilsRate}
              />
            </div>
          </div>

          {/* Transaction History - full width */}
          <div className="mt-6">
            <TransactionHistory
              transactions={data.transactions}
              currency={currency}
            />
          </div>
        </div>
      </main>

      {/* New Action Modal */}
      <NewActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        portfolios={portfolios}
      />
    </div>
  );
}


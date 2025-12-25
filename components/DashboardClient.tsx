"use client";

import { useState, useEffect, useTransition } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import NewActionModal from "./NewActionModal";
import { Portfolio, Currency } from "../types/database";
import { DashboardData, refreshDashboardData } from "../app/dashboard/actions";
import { formatCurrency, formatPercent } from "../lib/logic/calculations";

const STORAGE_KEY = "finbar_default_currency";

interface DashboardClientProps {
  portfolios: Portfolio[];
  initialData: DashboardData;
}

export default function DashboardClient({ portfolios, initialData }: DashboardClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currency, setCurrency] = useState<Currency>(initialData.displayCurrency);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData>(initialData);
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
      const result = await refreshDashboardData(newCurrency);
      if (result.success && result.data) {
        setData(result.data);
      }
    });
  }

  function handleRefresh() {
    setRefreshError(null);
    startTransition(async () => {
      const result = await refreshDashboardData(currency);
      if (result.success && result.data) {
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

  const currencySymbol = currency === "ILS" ? "₪" : "$";
  const hasData = data.totalValue > 0 || data.portfolios.length > 0;

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
          {/* Header */}
          <DashboardHeader
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

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900">סקירה כללית</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {data.lastUpdated
                ? `עודכן לאחרונה: ${new Date(data.lastUpdated).toLocaleString("he-IL")}`
                : "לחץ על 'רענן נתונים' לעדכון"
              }
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="שווי כל התיקים"
              value={formatCurrency(data.totalValue, currency)}
              subtitle={`מזומנים: ${formatCurrency(data.totalCash, currency)} | נכסים: ${formatCurrency(data.totalHoldings, currency)}`}
            />

            <StatCard
              title="יתרת מזומנים"
              value={formatCurrency(data.totalCash, currency)}
              subtitle="סה״כ מזומנים בכל התיקים"
            />

            <StatCard
              title="תשואה יומית"
              value={formatCurrency(data.dailyChange, currency)}
              change={{
                value: formatPercent(data.dailyChangePercent),
                isPositive: data.dailyChange >= 0,
              }}
              subtitle="שינוי מאתמול"
            />

            <StatCard
              title="תשואה כוללת"
              value={formatCurrency(data.totalReturn, currency)}
              change={{
                value: formatPercent(data.totalReturnPercent),
                isPositive: data.totalReturn >= 0,
              }}
              subtitle="רווח/הפסד לא ממומש"
            />
          </div>

          {/* Portfolios preview section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">התיקים שלי</h2>
            {portfolios.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p className="text-zinc-500 mb-3">עדיין אין לך תיקים</p>
                <a
                  href="/settings"
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#F7931A" }}
                >
                  צור את התיק הראשון שלך בהגדרות
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map((portfolio) => {
                  const portfolioData = data.portfolios.find(p => p.id === portfolio.id);
                  return (
                    <a
                      key={portfolio.id}
                      href={`/portfolios/${portfolio.id}`}
                      className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-zinc-900">{portfolio.name}</h3>
                        {portfolioData && portfolioData.changePercent !== 0 && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            portfolioData.changePercent >= 0
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-red-600 bg-red-50"
                          }`}>
                            {formatPercent(portfolioData.changePercent)}
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-semibold text-zinc-900">
                        {portfolioData
                          ? formatCurrency(portfolioData.totalValue, currency)
                          : formatCurrency(0, currency)
                        }
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {portfolio.account_number
                          ? `חשבון: ${portfolio.account_number}`
                          : `עמלה: $${portfolio.fee_amount || 0}`
                        }
                      </p>
                    </a>
                  );
                })}
              </div>
            )}
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

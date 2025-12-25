"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import NewActionModal from "./NewActionModal";
import { Portfolio } from "../types/database";

const STORAGE_KEY = "finbar_default_currency";

// Placeholder data - will be replaced with real calculations later
const PLACEHOLDER_DATA = {
  ILS: {
    totalValue: "₪125,430.50",
    cashBalance: "₪15,200",
    cashBreakdown: "₪15,200 + $1,250 (≈₪4,562)",
    dailyReturn: "₪320",
    dailyReturnPercent: "0.26%",
    totalReturn: "₪12,430",
    totalReturnPercent: "11.0%",
  },
  USD: {
    totalValue: "$34,365.89",
    cashBalance: "$5,424",
    cashBreakdown: "$4,165 (מ־₪) + $1,250",
    dailyReturn: "$87.67",
    dailyReturnPercent: "0.26%",
    totalReturn: "$3,405",
    totalReturnPercent: "11.0%",
  },
};

interface DashboardClientProps {
  portfolios: Portfolio[];
}

export default function DashboardClient({ portfolios }: DashboardClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currency, setCurrency] = useState<"ILS" | "USD">("ILS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved currency preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "ILS") {
      setCurrency(saved);
    }
  }, []);

  const data = PLACEHOLDER_DATA[currency];

  function handleCurrencyToggle() {
    const newCurrency = currency === "ILS" ? "USD" : "ILS";
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  }

  function handleRefresh() {
    // UI only - no actual refresh logic yet
    console.log("Refresh clicked");
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
          {/* Header */}
          <DashboardHeader
            currency={currency}
            onCurrencyToggle={handleCurrencyToggle}
            onNewAction={() => setIsModalOpen(true)}
            onRefresh={handleRefresh}
          />

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900">סקירה כללית</h1>
            <p className="text-sm text-zinc-500 mt-1">
              נתונים מעודכנים ליום {new Date().toLocaleDateString("he-IL")}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="שווי כל התיקים"
              value={data.totalValue}
              subtitle="סה״כ שווי נכסים + מזומנים"
            />

            <StatCard
              title="יתרת מזומנים"
              value={data.cashBalance}
              subtitle={data.cashBreakdown}
            />

            <StatCard
              title="תשואה יומית"
              value={data.dailyReturn}
              change={{
                value: data.dailyReturnPercent,
                isPositive: true,
              }}
              subtitle="שינוי מאתמול"
            />

            <StatCard
              title="תשואה כוללת"
              value={data.totalReturn}
              change={{
                value: data.totalReturnPercent,
                isPositive: true,
              }}
              subtitle="מאז תחילת התיק"
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
                {portfolios.map((portfolio) => (
                  <a
                    key={portfolio.id}
                    href={`/portfolios/${portfolio.id}`}
                    className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-zinc-900">{portfolio.name}</h3>
                      <span className="text-xs text-zinc-400">
                        עמלה: ${portfolio.fee_amount || 0}
                      </span>
                    </div>
                    <p className="text-xl font-semibold text-zinc-900">
                      {currency === "ILS" ? "₪0.00" : "$0.00"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {portfolio.account_number ? `חשבון: ${portfolio.account_number}` : "ללא מספר חשבון"}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Action Modal */}
      <NewActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}


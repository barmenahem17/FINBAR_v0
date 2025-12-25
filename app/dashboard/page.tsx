"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardHeader from "../../components/DashboardHeader";
import StatCard from "../../components/StatCard";
import NewActionModal from "../../components/NewActionModal";

// Placeholder data
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

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currency, setCurrency] = useState<"ILS" | "USD">("ILS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const data = PLACEHOLDER_DATA[currency];
  const currencySymbol = currency === "ILS" ? "₪" : "$";

  function handleCurrencyToggle() {
    setCurrency((prev) => (prev === "ILS" ? "USD" : "ILS"));
  }

  function handleRefresh() {
    // UI only - no actual refresh logic
    console.log("Refresh clicked");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
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
              נתונים מעודכנים ליום 25.12.2024 בשעה 14:30
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Portfolio cards - placeholder */}
              {[
                { name: "תיק מניות", value: "₪85,200", change: "+8.5%" },
                { name: "תיק קריפטו", value: "₪25,430", change: "+22.3%" },
                { name: "תיק חיסכון", value: "₪14,800", change: "+2.1%" },
              ].map((portfolio) => (
                <div
                  key={portfolio.name}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-zinc-900">{portfolio.name}</h3>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                      {portfolio.change}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-zinc-900">{portfolio.value}</p>
                </div>
              ))}
            </div>
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

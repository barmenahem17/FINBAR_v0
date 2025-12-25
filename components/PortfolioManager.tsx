"use client";

import { useState } from "react";
import { Portfolio } from "../types/database";
import PortfolioCard from "./PortfolioCard";
import AddPortfolioModal from "./AddPortfolioModal";

interface PortfolioManagerProps {
  portfolios: Portfolio[];
}

export default function PortfolioManager({ portfolios }: PortfolioManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">ניהול תיקים</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: "#F7931A", color: "white" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          הוסף תיק
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500 mb-3">עדיין אין לך תיקים</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium hover:underline"
            style={{ color: "#F7931A" }}
          >
            צור את התיק הראשון שלך
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}

      <AddPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}


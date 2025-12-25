interface DashboardHeaderProps {
  currency: "ILS" | "USD";
  onCurrencyToggle: () => void;
  onNewAction: () => void;
  onRefresh: () => void;
}

export default function DashboardHeader({
  currency,
  onCurrencyToggle,
  onNewAction,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      {/* Left side - Currency toggle */}
      <button
        onClick={onCurrencyToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
      >
        <span className={currency === "ILS" ? "text-zinc-900" : "text-zinc-400"}>₪</span>
        <span className="text-zinc-300">/</span>
        <span className={currency === "USD" ? "text-zinc-900" : "text-zinc-400"}>$</span>
      </button>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>רענן נתונים</span>
        </button>

        <button
          onClick={onNewAction}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors shadow-sm"
          style={{ backgroundColor: "#F7931A" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>פעולה חדשה</span>
        </button>
      </div>
    </header>
  );
}


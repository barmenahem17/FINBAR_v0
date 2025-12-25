import Link from "next/link";
import { createServerClient } from "../../lib/supabase/server";
import PortfolioManager from "../../components/PortfolioManager";
import CurrencyToggle from "../../components/CurrencyToggle";
import LogoutButton from "../../components/LogoutButton";

export default async function SettingsPage() {
  const supabase = await createServerClient();

  // Get user info
  const { data: { user } } = await supabase.auth.getUser();

  // Get portfolios
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Simple header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">הגדרות</h1>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <span>חזרה לדשבורד</span>
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Account info */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">פרטי חשבון</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">{user?.email || "לא מחובר"}</p>
              <p className="text-xs text-zinc-500">חשבון פעיל</p>
            </div>
          </div>
        </div>

        {/* Currency toggle */}
        <CurrencyToggle />

        {/* Portfolio manager */}
        <PortfolioManager portfolios={portfolios || []} />

        {/* Logout */}
        <LogoutButton />
      </main>
    </div>
  );
}

"use server";

import { createServerClient } from "../../../lib/supabase/server";
import { Currency, Transaction, Holding, CashBalance, Portfolio } from "../../../types/database";
import { calculatePortfolioTotals, PortfolioSummary, HoldingSummary } from "../../../lib/logic/aggregation";
import { DEFAULT_USDILS_RATE } from "../../../lib/logic/currency";

export interface PortfolioPageData {
  portfolio: Portfolio;
  summary: PortfolioSummary;
  holdings: HoldingSummary[];
  transactions: Transaction[];
  cashBalances: { currency: Currency; amount: number }[];
  usdilsRate: number;
  displayCurrency: Currency;
}

/**
 * Get all data needed for a portfolio page
 */
export async function getPortfolioPageData(
  portfolioId: string,
  displayCurrency: Currency = "ILS"
): Promise<{ data: PortfolioPageData | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "יש להתחבר" };
  }

  // Fetch portfolio
  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .single();

  if (portfolioError || !portfolio) {
    return { data: null, error: "תיק לא נמצא" };
  }

  // Fetch holdings for this portfolio
  const { data: holdings } = await supabase
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolioId);

  // Fetch cash balances for this portfolio
  const { data: cashBalances } = await supabase
    .from("cash_balances")
    .select("*")
    .eq("portfolio_id", portfolioId);

  // Fetch transactions for this portfolio (sorted by date, newest first)
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  // Fetch cached prices
  const { data: cachedPrices } = await supabase
    .from("prices")
    .select("symbol, price");

  const prices: Record<string, number> = {};
  (cachedPrices || []).forEach(p => {
    prices[p.symbol] = p.price;
  });

  // Fetch FX rate
  const { data: fxRate } = await supabase
    .from("fx_rates")
    .select("rate")
    .eq("pair", "USDILS")
    .single();

  const usdilsRate = fxRate?.rate || DEFAULT_USDILS_RATE;

  // Calculate portfolio totals
  const summary = calculatePortfolioTotals(
    portfolio,
    holdings || [],
    cashBalances || [],
    prices,
    displayCurrency,
    usdilsRate
  );

  // Format cash balances
  const formattedCashBalances = (cashBalances || []).map(cb => ({
    currency: cb.currency as Currency,
    amount: cb.amount,
  }));

  return {
    data: {
      portfolio,
      summary,
      holdings: summary.holdings,
      transactions: (transactions || []) as Transaction[],
      cashBalances: formattedCashBalances,
      usdilsRate,
      displayCurrency,
    },
    error: null,
  };
}

/**
 * Refresh portfolio data (fetch new prices and recalculate)
 */
export async function refreshPortfolioPageData(
  portfolioId: string,
  displayCurrency: Currency = "ILS"
): Promise<{ data: PortfolioPageData | null; error: string | null }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "יש להתחבר" };
  }

  // Import and call refresh logic
  const { refreshPortfolioData } = await import("../../../lib/logic/refresh");
  
  const result = await refreshPortfolioData(supabase, user.id, displayCurrency);
  
  if (!result.success) {
    return { data: null, error: result.error || "שגיאה ברענון הנתונים" };
  }

  // Return fresh data
  return getPortfolioPageData(portfolioId, displayCurrency);
}


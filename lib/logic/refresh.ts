import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Portfolio, Holding, CashBalance, Currency } from "../../types/database";
import { fetchPrices, fetchUSDILSRate } from "../api/prices";
import { calculatePortfolioTotals, calculateGlobalTotals, GlobalSummary, PortfolioSummary } from "./aggregation";
import { DEFAULT_USDILS_RATE } from "./currency";

export interface RefreshResult {
  success: boolean;
  globalSummary: GlobalSummary | null;
  usdilsRate: number;
  pricesUpdated: number;
  snapshotsSaved: number;
  error?: string;
}

/**
 * Main refresh function - fetches prices, calculates values, and saves snapshots
 */
export async function refreshPortfolioData(
  supabase: SupabaseClient<Database>,
  userId: string,
  displayCurrency: Currency = "ILS"
): Promise<RefreshResult> {
  try {
    // 1. Fetch all user's portfolios
    const { data: portfolios, error: portfoliosError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId);

    if (portfoliosError) {
      return { success: false, globalSummary: null, usdilsRate: 0, pricesUpdated: 0, snapshotsSaved: 0, error: portfoliosError.message };
    }

    if (!portfolios || portfolios.length === 0) {
      return {
        success: true,
        globalSummary: {
          totalValue: 0,
          totalCash: 0,
          totalHoldings: 0,
          totalUnrealizedPL: 0,
          totalUnrealizedPLPercent: 0,
          totalCostBasis: 0,
          displayCurrency,
          usdilsRate: DEFAULT_USDILS_RATE,
          portfolioSummaries: [],
        },
        usdilsRate: DEFAULT_USDILS_RATE,
        pricesUpdated: 0,
        snapshotsSaved: 0,
      };
    }

    const portfolioIds = portfolios.map(p => p.id);

    // 2. Fetch all holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from("holdings")
      .select("*")
      .in("portfolio_id", portfolioIds);

    if (holdingsError) {
      return { success: false, globalSummary: null, usdilsRate: 0, pricesUpdated: 0, snapshotsSaved: 0, error: holdingsError.message };
    }

    // 3. Fetch all cash balances
    const { data: cashBalances, error: cashError } = await supabase
      .from("cash_balances")
      .select("*")
      .in("portfolio_id", portfolioIds);

    if (cashError) {
      return { success: false, globalSummary: null, usdilsRate: 0, pricesUpdated: 0, snapshotsSaved: 0, error: cashError.message };
    }

    // 4. Get unique symbols to fetch prices for
    const symbols = [...new Set((holdings || []).map(h => h.symbol))];

    // 5. Fetch current prices from API
    const prices = await fetchPrices(symbols);
    
    // 6. Save prices to database
    let pricesUpdated = 0;
    for (const [symbol, price] of Object.entries(prices)) {
      const { error } = await supabase
        .from("prices")
        .upsert({
          symbol,
          price,
          currency: "USD",
          updated_at: new Date().toISOString(),
        }, { onConflict: "symbol" });
      
      if (!error) pricesUpdated++;
    }

    // 7. Fetch USD/ILS rate
    let usdilsRate = await fetchUSDILSRate();
    if (!usdilsRate) {
      usdilsRate = DEFAULT_USDILS_RATE;
    }

    // Save FX rate to database
    await supabase
      .from("fx_rates")
      .upsert({
        pair: "USDILS",
        rate: usdilsRate,
        updated_at: new Date().toISOString(),
      }, { onConflict: "pair" });

    // 8. Calculate portfolio summaries
    const portfolioSummaries: PortfolioSummary[] = [];
    
    for (const portfolio of portfolios) {
      const portfolioHoldings = (holdings || []).filter(h => h.portfolio_id === portfolio.id);
      const portfolioCash = (cashBalances || []).filter(c => c.portfolio_id === portfolio.id);
      
      const summary = calculatePortfolioTotals(
        portfolio,
        portfolioHoldings,
        portfolioCash,
        prices,
        displayCurrency,
        usdilsRate
      );
      
      portfolioSummaries.push(summary);
    }

    // 9. Calculate global summary
    const globalSummary = calculateGlobalTotals(portfolioSummaries, displayCurrency, usdilsRate);

    // 10. Save snapshots (one per portfolio + one global)
    const today = new Date().toISOString().split("T")[0];
    let snapshotsSaved = 0;

    // Save individual portfolio snapshots
    for (const summary of portfolioSummaries) {
      const { error } = await supabase
        .from("snapshots")
        .upsert({
          user_id: userId,
          portfolio_id: summary.portfolioId,
          date: today,
          total_value: summary.totalValue,
          cash_value: summary.cashValue,
          holdings_value: summary.holdingsValue,
          currency: displayCurrency,
          usdils_rate: usdilsRate,
        }, { onConflict: "portfolio_id,date" });
      
      if (!error) snapshotsSaved++;
    }

    // Save global snapshot (portfolio_id = null)
    const { error: globalSnapshotError } = await supabase
      .from("snapshots")
      .upsert({
        user_id: userId,
        portfolio_id: null,
        date: today,
        total_value: globalSummary.totalValue,
        cash_value: globalSummary.totalCash,
        holdings_value: globalSummary.totalHoldings,
        currency: displayCurrency,
        usdils_rate: usdilsRate,
      }, { onConflict: "portfolio_id,date" });
    
    if (!globalSnapshotError) snapshotsSaved++;

    return {
      success: true,
      globalSummary,
      usdilsRate,
      pricesUpdated,
      snapshotsSaved,
    };

  } catch (error) {
    console.error("Refresh error:", error);
    return {
      success: false,
      globalSummary: null,
      usdilsRate: 0,
      pricesUpdated: 0,
      snapshotsSaved: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate live data directly from cash_balances and holdings
 * Used as fallback when no snapshot exists or as fresh data
 */
export async function calculateLiveData(
  supabase: SupabaseClient<Database>,
  userId: string,
  displayCurrency: Currency = "ILS"
): Promise<{
  globalSummary: GlobalSummary | null;
  usdilsRate: number;
}> {
  // Get all portfolios
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId);

  if (!portfolios || portfolios.length === 0) {
    return {
      globalSummary: null,
      usdilsRate: DEFAULT_USDILS_RATE,
    };
  }

  const portfolioIds = portfolios.map(p => p.id);

  // Get holdings and cash balances
  const { data: holdings } = await supabase
    .from("holdings")
    .select("*")
    .in("portfolio_id", portfolioIds);

  const { data: cashBalances } = await supabase
    .from("cash_balances")
    .select("*")
    .in("portfolio_id", portfolioIds);

  // Get cached prices from database (no API call)
  const { data: cachedPrices } = await supabase
    .from("prices")
    .select("symbol, price");

  const prices: Record<string, number> = {};
  (cachedPrices || []).forEach(p => {
    prices[p.symbol] = p.price;
  });

  // Get latest FX rate
  const { data: fxRate } = await supabase
    .from("fx_rates")
    .select("rate")
    .eq("pair", "USDILS")
    .single();

  const usdilsRate = fxRate?.rate || DEFAULT_USDILS_RATE;

  // Calculate portfolio summaries
  const portfolioSummaries: PortfolioSummary[] = [];
  
  for (const portfolio of portfolios) {
    const portfolioHoldings = (holdings || []).filter(h => h.portfolio_id === portfolio.id);
    const portfolioCash = (cashBalances || []).filter(c => c.portfolio_id === portfolio.id);
    
    const summary = calculatePortfolioTotals(
      portfolio,
      portfolioHoldings,
      portfolioCash,
      prices,
      displayCurrency,
      usdilsRate
    );
    
    portfolioSummaries.push(summary);
  }

  // Calculate global summary
  const globalSummary = calculateGlobalTotals(portfolioSummaries, displayCurrency, usdilsRate);

  return {
    globalSummary,
    usdilsRate,
  };
}

/**
 * Get the latest snapshot data without refreshing from API
 * Falls back to live calculation if no snapshot exists
 */
export async function getLatestSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
  displayCurrency: Currency = "ILS"
): Promise<{
  globalSummary: GlobalSummary | null;
  lastUpdated: string | null;
  usdilsRate: number;
}> {
  // Get latest FX rate
  const { data: fxRate } = await supabase
    .from("fx_rates")
    .select("rate")
    .eq("pair", "USDILS")
    .single();

  const usdilsRate = fxRate?.rate || DEFAULT_USDILS_RATE;

  // Get the latest global snapshot
  const { data: latestSnapshot } = await supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", userId)
    .is("portfolio_id", null)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  // If no snapshot exists, calculate from live data
  if (!latestSnapshot) {
    const liveData = await calculateLiveData(supabase, userId, displayCurrency);
    return {
      globalSummary: liveData.globalSummary,
      lastUpdated: null,
      usdilsRate: liveData.usdilsRate,
    };
  }

  // Get portfolio snapshots for the same date
  const { data: portfolioSnapshots } = await supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("date", latestSnapshot.date)
    .not("portfolio_id", "is", null);

  // Get portfolio names
  const portfolioIds = (portfolioSnapshots || [])
    .map(s => s.portfolio_id)
    .filter((id): id is string => id !== null);
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, name")
    .in("id", portfolioIds);

  const portfolioNameMap = new Map((portfolios || []).map(p => [p.id, p.name]));

  // Build portfolio summaries from snapshots
  const portfolioSummaries: PortfolioSummary[] = (portfolioSnapshots || []).map(snap => ({
    portfolioId: snap.portfolio_id!,
    portfolioName: portfolioNameMap.get(snap.portfolio_id!) || "Unknown",
    holdingsValue: snap.holdings_value,
    cashValue: snap.cash_value,
    totalValue: snap.total_value,
    unrealizedPL: 0, // Not stored in snapshot
    unrealizedPLPercent: 0,
    costBasis: 0,
    holdings: [],
    cashBalances: [],
  }));

  const globalSummary: GlobalSummary = {
    totalValue: latestSnapshot.total_value,
    totalCash: latestSnapshot.cash_value,
    totalHoldings: latestSnapshot.holdings_value,
    totalUnrealizedPL: 0, // Need to calculate from actual holdings
    totalUnrealizedPLPercent: 0,
    totalCostBasis: 0,
    displayCurrency,
    usdilsRate,
    portfolioSummaries,
  };

  return {
    globalSummary,
    lastUpdated: latestSnapshot.created_at,
    usdilsRate,
  };
}

/**
 * Get yesterday's snapshot for calculating daily change
 */
export async function getYesterdaySnapshot(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ totalValue: number } | null> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data } = await supabase
    .from("snapshots")
    .select("total_value")
    .eq("user_id", userId)
    .is("portfolio_id", null)
    .eq("date", yesterdayStr)
    .single();

  if (!data) return null;
  
  return { totalValue: data.total_value };
}


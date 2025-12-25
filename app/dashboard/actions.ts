"use server";

import { createServerClient } from "../../lib/supabase/server";
import { refreshPortfolioData, getLatestSnapshot, getYesterdaySnapshot, calculateLiveData } from "../../lib/logic/refresh";
import { calculateDailyChange } from "../../lib/logic/aggregation";
import { Currency } from "../../types/database";
import { revalidatePath } from "next/cache";

export interface DashboardData {
  totalValue: number;
  totalCash: number;
  totalHoldings: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  displayCurrency: Currency;
  usdilsRate: number;
  lastUpdated: string | null;
  portfolios: {
    id: string;
    name: string;
    totalValue: number;
    change: number;
    changePercent: number;
  }[];
}

export async function getDashboardData(
  displayCurrency: Currency = "ILS"
): Promise<DashboardData> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return getEmptyDashboardData(displayCurrency);
  }

  // Always calculate live data for accurate current values
  // This ensures we always show the latest cash_balances and holdings
  const liveData = await calculateLiveData(supabase, user.id, displayCurrency);
  
  // Get the latest snapshot for lastUpdated timestamp
  const snapshotData = await getLatestSnapshot(
    supabase,
    user.id,
    displayCurrency
  );
  
  // Use live data for values, snapshot for timestamp
  const globalSummary = liveData.globalSummary;
  const usdilsRate = liveData.usdilsRate;
  const lastUpdated = snapshotData.lastUpdated;

  if (!globalSummary) {
    return getEmptyDashboardData(displayCurrency);
  }

  // Get yesterday's snapshot for daily change
  const yesterday = await getYesterdaySnapshot(supabase, user.id);
  const { amount: dailyChange, percent: dailyChangePercent } = yesterday
    ? calculateDailyChange(globalSummary.totalValue, yesterday.totalValue)
    : { amount: 0, percent: 0 };

  // Calculate total return (P/L)
  const totalReturn = globalSummary.totalUnrealizedPL;
  const totalReturnPercent = globalSummary.totalUnrealizedPLPercent;

  return {
    totalValue: globalSummary.totalValue,
    totalCash: globalSummary.totalCash,
    totalHoldings: globalSummary.totalHoldings,
    dailyChange,
    dailyChangePercent,
    totalReturn,
    totalReturnPercent,
    displayCurrency,
    usdilsRate,
    lastUpdated,
    portfolios: globalSummary.portfolioSummaries.map(p => ({
      id: p.portfolioId,
      name: p.portfolioName,
      totalValue: p.totalValue,
      change: p.unrealizedPL,
      changePercent: p.unrealizedPLPercent,
    })),
  };
}

export async function refreshDashboardData(
  displayCurrency: Currency = "ILS"
): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "יש להתחבר" };
  }

  const result = await refreshPortfolioData(supabase, user.id, displayCurrency);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard");

  // Get updated data
  const dashboardData = await getDashboardData(displayCurrency);

  return { success: true, data: dashboardData };
}

function getEmptyDashboardData(displayCurrency: Currency): DashboardData {
  return {
    totalValue: 0,
    totalCash: 0,
    totalHoldings: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    displayCurrency,
    usdilsRate: 3.65,
    lastUpdated: null,
    portfolios: [],
  };
}


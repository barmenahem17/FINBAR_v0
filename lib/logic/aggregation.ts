import Decimal from "decimal.js";
import { Holding, CashBalance, Portfolio, Currency } from "../../types/database";
import { calculateMarketValue, calculateUnrealizedPL, roundTo } from "./calculations";
import { convertToDisplayCurrency, aggregateInCurrency } from "./currency";

// Configure Decimal.js
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface HoldingSummary {
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  currency: Currency;
}

export interface PortfolioSummary {
  portfolioId: string;
  portfolioName: string;
  holdingsValue: number;        // Total value of all holdings
  cashValue: number;            // Total cash in all currencies
  totalValue: number;           // Holdings + Cash
  unrealizedPL: number;         // Total unrealized P/L
  unrealizedPLPercent: number;  // Total unrealized P/L %
  costBasis: number;            // Total cost basis
  holdings: HoldingSummary[];
  cashBalances: { currency: Currency; amount: number }[];
}

export interface GlobalSummary {
  totalValue: number;           // Sum of all portfolios
  totalCash: number;            // Sum of all cash
  totalHoldings: number;        // Sum of all holdings
  totalUnrealizedPL: number;    // Sum of all P/L
  totalUnrealizedPLPercent: number;
  totalCostBasis: number;
  displayCurrency: Currency;
  usdilsRate: number;
  portfolioSummaries: PortfolioSummary[];
}

/**
 * Calculate summary for a single holding
 */
export function calculateHoldingSummary(
  holding: Holding,
  currentPrice: number,
  displayCurrency: Currency,
  usdilsRate: number
): HoldingSummary {
  const marketValue = calculateMarketValue(currentPrice, holding.quantity);
  const costBasis = new Decimal(holding.avg_cost).times(holding.quantity).toNumber();
  const { amount: pl, percent: plPercent } = calculateUnrealizedPL(
    currentPrice,
    holding.avg_cost,
    holding.quantity
  );

  // Convert to display currency
  const holdingCurrency = holding.currency as Currency;
  const marketValueDisplay = convertToDisplayCurrency(marketValue, holdingCurrency, displayCurrency, usdilsRate);
  const costBasisDisplay = convertToDisplayCurrency(costBasis, holdingCurrency, displayCurrency, usdilsRate);
  const plDisplay = convertToDisplayCurrency(pl, holdingCurrency, displayCurrency, usdilsRate);

  return {
    symbol: holding.symbol,
    quantity: holding.quantity,
    avgCost: holding.avg_cost,
    currentPrice,
    marketValue: roundTo(marketValueDisplay, 2),
    costBasis: roundTo(costBasisDisplay, 2),
    unrealizedPL: roundTo(plDisplay, 2),
    unrealizedPLPercent: roundTo(plPercent, 2),
    currency: displayCurrency,
  };
}

/**
 * Calculate totals for a single portfolio
 */
export function calculatePortfolioTotals(
  portfolio: Portfolio,
  holdings: Holding[],
  cashBalances: CashBalance[],
  prices: Record<string, number>,  // symbol -> price
  displayCurrency: Currency,
  usdilsRate: number
): PortfolioSummary {
  // Calculate holdings summaries
  const holdingSummaries: HoldingSummary[] = [];
  let totalHoldingsValue = new Decimal(0);
  let totalCostBasis = new Decimal(0);
  let totalPL = new Decimal(0);

  for (const holding of holdings) {
    if (holding.quantity <= 0) continue;

    const currentPrice = prices[holding.symbol] || 0;
    const summary = calculateHoldingSummary(holding, currentPrice, displayCurrency, usdilsRate);
    
    holdingSummaries.push(summary);
    totalHoldingsValue = totalHoldingsValue.plus(summary.marketValue);
    totalCostBasis = totalCostBasis.plus(summary.costBasis);
    totalPL = totalPL.plus(summary.unrealizedPL);
  }

  // Calculate cash totals
  const cashValues = cashBalances.map(cb => ({
    amount: cb.amount,
    currency: cb.currency as Currency,
  }));
  
  const totalCash = aggregateInCurrency(cashValues, displayCurrency, usdilsRate);

  // Calculate totals
  const totalValue = totalHoldingsValue.plus(totalCash).toNumber();
  
  let plPercent = 0;
  if (!totalCostBasis.isZero()) {
    plPercent = totalPL.dividedBy(totalCostBasis).times(100).toNumber();
  }

  return {
    portfolioId: portfolio.id,
    portfolioName: portfolio.name,
    holdingsValue: roundTo(totalHoldingsValue.toNumber(), 2),
    cashValue: roundTo(totalCash, 2),
    totalValue: roundTo(totalValue, 2),
    unrealizedPL: roundTo(totalPL.toNumber(), 2),
    unrealizedPLPercent: roundTo(plPercent, 2),
    costBasis: roundTo(totalCostBasis.toNumber(), 2),
    holdings: holdingSummaries,
    cashBalances: cashValues,
  };
}

/**
 * Calculate global totals across all portfolios
 */
export function calculateGlobalTotals(
  portfolioSummaries: PortfolioSummary[],
  displayCurrency: Currency,
  usdilsRate: number
): GlobalSummary {
  let totalValue = new Decimal(0);
  let totalCash = new Decimal(0);
  let totalHoldings = new Decimal(0);
  let totalPL = new Decimal(0);
  let totalCostBasis = new Decimal(0);

  for (const summary of portfolioSummaries) {
    totalValue = totalValue.plus(summary.totalValue);
    totalCash = totalCash.plus(summary.cashValue);
    totalHoldings = totalHoldings.plus(summary.holdingsValue);
    totalPL = totalPL.plus(summary.unrealizedPL);
    totalCostBasis = totalCostBasis.plus(summary.costBasis);
  }

  let plPercent = 0;
  if (!totalCostBasis.isZero()) {
    plPercent = totalPL.dividedBy(totalCostBasis).times(100).toNumber();
  }

  return {
    totalValue: roundTo(totalValue.toNumber(), 2),
    totalCash: roundTo(totalCash.toNumber(), 2),
    totalHoldings: roundTo(totalHoldings.toNumber(), 2),
    totalUnrealizedPL: roundTo(totalPL.toNumber(), 2),
    totalUnrealizedPLPercent: roundTo(plPercent, 2),
    totalCostBasis: roundTo(totalCostBasis.toNumber(), 2),
    displayCurrency,
    usdilsRate,
    portfolioSummaries,
  };
}

/**
 * Calculate daily change based on snapshots
 */
export function calculateDailyChange(
  todayValue: number,
  yesterdayValue: number
): { amount: number; percent: number } {
  const today = new Decimal(todayValue);
  const yesterday = new Decimal(yesterdayValue);

  if (yesterday.isZero()) {
    return { amount: 0, percent: 0 };
  }

  const change = today.minus(yesterday);
  const percent = change.dividedBy(yesterday).times(100);

  return {
    amount: roundTo(change.toNumber(), 2),
    percent: roundTo(percent.toNumber(), 2),
  };
}


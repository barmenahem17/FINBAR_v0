import Decimal from "decimal.js";

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface BuyTransaction {
  quantity: number;
  price: number;
  fee?: number;
}

export interface UnrealizedPL {
  amount: number;
  percent: number;
}

/**
 * Calculate Weighted Average Cost (WAC)
 * WAC = Σ(Quantity × Price) / Σ(Quantity)
 * 
 * Note: This assumes all transactions are BUY transactions.
 * For SELL transactions, WAC doesn't change - only quantity decreases.
 */
export function calculateWAC(buys: BuyTransaction[]): number {
  if (buys.length === 0) return 0;

  let totalCost = new Decimal(0);
  let totalQuantity = new Decimal(0);

  for (const buy of buys) {
    const qty = new Decimal(buy.quantity);
    const price = new Decimal(buy.price);
    const fee = new Decimal(buy.fee || 0);

    // Total cost includes fees
    totalCost = totalCost.plus(qty.times(price)).plus(fee);
    totalQuantity = totalQuantity.plus(qty);
  }

  if (totalQuantity.isZero()) return 0;

  return totalCost.dividedBy(totalQuantity).toNumber();
}

/**
 * Update WAC after a new BUY transaction
 * New WAC = (Old WAC × Old Qty + New Price × New Qty + Fee) / (Old Qty + New Qty)
 */
export function updateWACAfterBuy(
  currentWAC: number,
  currentQuantity: number,
  newPrice: number,
  newQuantity: number,
  fee: number = 0
): number {
  const oldWAC = new Decimal(currentWAC);
  const oldQty = new Decimal(currentQuantity);
  const price = new Decimal(newPrice);
  const qty = new Decimal(newQuantity);
  const feeDecimal = new Decimal(fee);

  const oldValue = oldWAC.times(oldQty);
  const newValue = price.times(qty).plus(feeDecimal);
  const totalQty = oldQty.plus(qty);

  if (totalQty.isZero()) return 0;

  return oldValue.plus(newValue).dividedBy(totalQty).toNumber();
}

/**
 * Calculate Unrealized Profit/Loss
 * P/L Amount = (Current Price - WAC) × Quantity
 * P/L Percent = ((Current Price - WAC) / WAC) × 100
 */
export function calculateUnrealizedPL(
  currentPrice: number,
  avgCost: number,
  quantity: number
): UnrealizedPL {
  const price = new Decimal(currentPrice);
  const wac = new Decimal(avgCost);
  const qty = new Decimal(quantity);

  const plAmount = price.minus(wac).times(qty);
  
  let plPercent = new Decimal(0);
  if (!wac.isZero()) {
    plPercent = price.minus(wac).dividedBy(wac).times(100);
  }

  return {
    amount: plAmount.toNumber(),
    percent: plPercent.toNumber(),
  };
}

/**
 * Calculate total cost basis for a position
 * Cost Basis = Σ(Quantity × Price) + Σ(Fees)
 */
export function calculateCostBasis(buys: BuyTransaction[]): number {
  let totalCost = new Decimal(0);

  for (const buy of buys) {
    const qty = new Decimal(buy.quantity);
    const price = new Decimal(buy.price);
    const fee = new Decimal(buy.fee || 0);

    totalCost = totalCost.plus(qty.times(price)).plus(fee);
  }

  return totalCost.toNumber();
}

/**
 * Calculate current market value of a position
 * Market Value = Current Price × Quantity
 */
export function calculateMarketValue(
  currentPrice: number,
  quantity: number
): number {
  const price = new Decimal(currentPrice);
  const qty = new Decimal(quantity);

  return price.times(qty).toNumber();
}

/**
 * Calculate daily return
 * Daily Return = Today's Value - Yesterday's Value
 * Daily Return % = (Daily Return / Yesterday's Value) × 100
 */
export function calculateDailyReturn(
  todayValue: number,
  yesterdayValue: number
): UnrealizedPL {
  const today = new Decimal(todayValue);
  const yesterday = new Decimal(yesterdayValue);

  const returnAmount = today.minus(yesterday);
  
  let returnPercent = new Decimal(0);
  if (!yesterday.isZero()) {
    returnPercent = returnAmount.dividedBy(yesterday).times(100);
  }

  return {
    amount: returnAmount.toNumber(),
    percent: returnPercent.toNumber(),
  };
}

/**
 * Round a number to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  return new Decimal(value).toDecimalPlaces(decimals).toNumber();
}

/**
 * Format number as currency string
 */
export function formatCurrency(
  value: number,
  currency: "USD" | "ILS",
  decimals: number = 2
): string {
  const rounded = roundTo(value, decimals);
  const symbol = currency === "USD" ? "$" : "₪";
  const formatted = Math.abs(rounded).toLocaleString("he-IL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (rounded < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

/**
 * Format percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const rounded = roundTo(value, decimals);
  const sign = rounded >= 0 ? "+" : "";
  return `${sign}${rounded.toFixed(decimals)}%`;
}


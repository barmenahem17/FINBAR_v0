import Decimal from "decimal.js";
import { Currency } from "../../types/database";

// Configure Decimal.js
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Convert amount from one currency to another
 * 
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency (USD or ILS)
 * @param toCurrency - Target currency (USD or ILS)
 * @param usdilsRate - The USD to ILS exchange rate (e.g., 3.65 means 1 USD = 3.65 ILS)
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  usdilsRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const amountDecimal = new Decimal(amount);
  const rate = new Decimal(usdilsRate);

  if (fromCurrency === "USD" && toCurrency === "ILS") {
    // USD to ILS: multiply by rate
    return amountDecimal.times(rate).toNumber();
  } else {
    // ILS to USD: divide by rate
    return amountDecimal.dividedBy(rate).toNumber();
  }
}

/**
 * Convert to display currency
 * All amounts in the system are stored in their original currency.
 * This function converts them to the user's selected display currency.
 */
export function convertToDisplayCurrency(
  amount: number,
  originalCurrency: Currency,
  displayCurrency: Currency,
  usdilsRate: number
): number {
  return convertCurrency(amount, originalCurrency, displayCurrency, usdilsRate);
}

/**
 * Aggregate multiple values in different currencies to a single target currency
 */
export function aggregateInCurrency(
  values: { amount: number; currency: Currency }[],
  targetCurrency: Currency,
  usdilsRate: number
): number {
  let total = new Decimal(0);

  for (const { amount, currency } of values) {
    const converted = convertCurrency(amount, currency, targetCurrency, usdilsRate);
    total = total.plus(new Decimal(converted));
  }

  return total.toNumber();
}

/**
 * Get the currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === "USD" ? "$" : "₪";
}

/**
 * Format amount with currency symbol
 */
export function formatWithCurrency(
  amount: number,
  currency: Currency,
  decimals: number = 2
): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.abs(amount).toLocaleString("he-IL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (amount < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

/**
 * Get default USD/ILS rate (fallback when no rate is available)
 */
export const DEFAULT_USDILS_RATE = 3.65;

/**
 * Validate that the rate is reasonable (sanity check)
 */
export function isValidFxRate(rate: number): boolean {
  // USD/ILS rate should be between 2.5 and 5.0 (reasonable historical range)
  return rate >= 2.5 && rate <= 5.0;
}


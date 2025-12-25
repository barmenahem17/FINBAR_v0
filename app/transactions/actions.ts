"use server";

import { createServerClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";
import { TransactionType, Currency } from "../../types/database";
import Decimal from "decimal.js";
import { refreshPortfolioData } from "../../lib/logic/refresh";

interface TransactionInput {
  portfolioId: string;
  type: TransactionType;
  symbol?: string;
  quantity?: number;
  price?: number;
  amount?: number;
  currency: Currency;
  fee?: number;
  fxRate?: number;
  fromCurrency?: Currency;
  toCurrency?: Currency;
}

export async function createTransaction(input: TransactionInput) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "יש להתחבר כדי לבצע פעולה" };
  }

  // Validate portfolio belongs to user
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, fee_amount")
    .eq("id", input.portfolioId)
    .eq("user_id", user.id)
    .single();

  if (!portfolio) {
    return { error: "תיק לא נמצא" };
  }

  // Use portfolio default fee if not specified
  const fee = input.fee ?? portfolio.fee_amount ?? 0;

  // Create transaction record
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    portfolio_id: input.portfolioId,
    type: input.type,
    symbol: input.symbol?.toUpperCase() || null,
    quantity: input.quantity || null,
    price: input.price || null,
    amount: input.amount || null,
    currency: input.currency,
    fee: fee,
    fx_rate: input.fxRate || null,
    from_currency: input.fromCurrency || null,
    to_currency: input.toCurrency || null,
  });

  if (txError) {
    console.error("Error creating transaction:", txError);
    return { error: "שגיאה ביצירת העסקה" };
  }

  // Update holdings and cash based on transaction type
  try {
    switch (input.type) {
      case "BUY":
        await handleBuy(supabase, user.id, input.portfolioId, input.symbol!, input.quantity!, input.price!, input.currency, fee);
        break;
      case "SELL":
        await handleSell(supabase, user.id, input.portfolioId, input.symbol!, input.quantity!, input.price!, input.currency, fee);
        break;
      case "DEPOSIT":
        await handleDeposit(supabase, user.id, input.portfolioId, input.amount!, input.currency);
        break;
      case "WITHDRAW":
        await handleWithdraw(supabase, user.id, input.portfolioId, input.amount!, input.currency);
        break;
      case "CONVERT":
        await handleConvert(supabase, user.id, input.portfolioId, input.amount!, input.fromCurrency!, input.toCurrency!, input.fxRate!);
        break;
      case "DIVIDEND":
        await handleDividend(supabase, user.id, input.portfolioId, input.amount!, input.currency);
        break;
    }
  } catch (err) {
    console.error("Error updating balances:", err);
    return { error: "העסקה נשמרה אך היתרות לא עודכנו" };
  }

  // Refresh portfolio data to update snapshots immediately
  try {
    await refreshPortfolioData(supabase, user.id, "ILS");
  } catch (refreshErr) {
    console.error("Error refreshing data after transaction:", refreshErr);
    // Don't fail the transaction if refresh fails - data is still saved
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true };
}

// Helper functions for each transaction type

async function handleBuy(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  symbol: string,
  quantity: number,
  price: number,
  currency: Currency,
  fee: number
) {
  const upperSymbol = symbol.toUpperCase();
  
  // Get current holding
  const { data: holding } = await supabase
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("symbol", upperSymbol)
    .single();

  if (holding) {
    // Update existing holding with new WAC
    const oldQty = new Decimal(holding.quantity);
    const oldCost = new Decimal(holding.avg_cost);
    const newQty = new Decimal(quantity);
    const newPrice = new Decimal(price);
    const feeDecimal = new Decimal(fee);

    const totalOldValue = oldCost.times(oldQty);
    const totalNewValue = newPrice.times(newQty).plus(feeDecimal);
    const totalQty = oldQty.plus(newQty);
    const newAvgCost = totalOldValue.plus(totalNewValue).dividedBy(totalQty);

    await supabase
      .from("holdings")
      .update({
        quantity: totalQty.toNumber(),
        avg_cost: newAvgCost.toNumber(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", holding.id);
  } else {
    // Create new holding
    const avgCost = new Decimal(price).plus(new Decimal(fee).dividedBy(quantity));
    
    await supabase.from("holdings").insert({
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: upperSymbol,
      quantity: quantity,
      avg_cost: avgCost.toNumber(),
      currency: currency,
    });
  }

  // Deduct from cash balance
  const totalCost = new Decimal(price).times(quantity).plus(fee);
  await updateCashBalance(supabase, userId, portfolioId, currency, -totalCost.toNumber());
}

async function handleSell(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  symbol: string,
  quantity: number,
  price: number,
  currency: Currency,
  fee: number
) {
  const upperSymbol = symbol.toUpperCase();
  
  // Get current holding
  const { data: holding } = await supabase
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("symbol", upperSymbol)
    .single();

  if (!holding || holding.quantity < quantity) {
    throw new Error("אין מספיק יחידות למכירה");
  }

  const newQty = new Decimal(holding.quantity).minus(quantity);

  if (newQty.isZero()) {
    // Delete holding if sold all
    await supabase.from("holdings").delete().eq("id", holding.id);
  } else {
    // Update quantity (WAC stays the same on sell)
    await supabase
      .from("holdings")
      .update({
        quantity: newQty.toNumber(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", holding.id);
  }

  // Add to cash balance (minus fee)
  const proceeds = new Decimal(price).times(quantity).minus(fee);
  await updateCashBalance(supabase, userId, portfolioId, currency, proceeds.toNumber());
}

async function handleDeposit(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  amount: number,
  currency: Currency
) {
  await updateCashBalance(supabase, userId, portfolioId, currency, amount);
}

async function handleWithdraw(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  amount: number,
  currency: Currency
) {
  await updateCashBalance(supabase, userId, portfolioId, currency, -amount);
}

async function handleConvert(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  fxRate: number
) {
  // Deduct from source currency
  await updateCashBalance(supabase, userId, portfolioId, fromCurrency, -amount);

  // Add to target currency
  const convertedAmount = new Decimal(amount).times(fxRate).toNumber();
  await updateCashBalance(supabase, userId, portfolioId, toCurrency, convertedAmount);
}

async function handleDividend(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  amount: number,
  currency: Currency
) {
  await updateCashBalance(supabase, userId, portfolioId, currency, amount);
}

async function updateCashBalance(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  portfolioId: string,
  currency: Currency,
  delta: number
) {
  // Get current balance
  const { data: balance } = await supabase
    .from("cash_balances")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("currency", currency)
    .single();

  if (balance) {
    const newAmount = new Decimal(balance.amount).plus(delta);
    await supabase
      .from("cash_balances")
      .update({
        amount: newAmount.toNumber(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", balance.id);
  } else {
    await supabase.from("cash_balances").insert({
      user_id: userId,
      portfolio_id: portfolioId,
      currency: currency,
      amount: delta,
    });
  }
}


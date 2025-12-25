# FINBAR v1 (Personal) — Context

## Goal
A personal investment dashboard for Bar. Manual transactions entry + real-time prices on demand (Refresh). Supports multiple portfolios and global currency display toggle (ILS/USD).

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- RTL Hebrew UI by default

## Core Screens
- /login, /signup
- /dashboard (global view)
- /portfolios/[id] (single portfolio view)
- /settings (manage portfolios, fees, default currency, logout)

## Sidebar (Right)
- Title: FINBAR (bitcoin orange). Click => /dashboard
- "התיקים שלי": dynamic list of portfolios
- bottom: Settings + Logout

## Transactions (New Action)
Types:
- BUY: symbol, qty, price, fee(optional default from portfolio)
- SELL: existing holding symbol, qty, price, fee(optional)
- DEPOSIT/WITHDRAW: currency, amount
- CONVERT: from_currency, to_currency, fx_rate
- DIVIDEND: symbol, amount, currency

## Currency Rules (Critical)
- Store all amounts in original currency.
- UI displays everything in selected default currency (ILS or USD).
- Conversion uses USDILS rate (latest fetched on Refresh).
- Daily return should account for cashflows (don’t fake performance).

## Refresh Flow (Important)
User clicks Refresh:
1) Fetch latest prices for held symbols + USDILS
2) Compute current portfolio values and cash balances
3) Save daily snapshot (for speed + fewer API calls)
Dashboard reads from snapshots by default

## Must-have Quality
- Correct calculations (value, cash, daily PnL, total return)
- Clean UI, minimal, professional
- Never break RTL

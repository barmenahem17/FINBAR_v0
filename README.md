1. Goal:
A personal investment dashboard designed to aggregate and track performance across multiple portfolios (e.g., Excellence, Interactive Brokers, Kraken) in a single unified view. The application is built for personal use by Bar on a MacBook.

2. Tech Stack:
Frontend: Next.js (App Router), React 19, Tailwind CSS v4.
Backend & Auth: Supabase (PostgreSQL).
UI Logic: Full Hebrew (RTL) support by default.

3. Core Rules for Cursor:
Language & Direction: The UI must always be in Hebrew with Right-to-Left (RTL) orientation.
Currency Toggle: The system must support a global toggle between Israeli Shekels (₪) and US Dollars ($) for all displayed values.
Data Entry: All data is manually entered via forms (Buy, Sell, Deposit, Withdraw, Convert, Dividend); no automated bank APIs at this stage.
Design: Clean, professional, and minimalist financial UI.
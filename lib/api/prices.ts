/**
 * Price fetching utilities using TwelveData API
 * 
 * Note: Requires TWELVEDATA_API_KEY environment variable
 */

const TWELVEDATA_BASE_URL = "https://api.twelvedata.com";

export interface PriceQuote {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
}

export interface FxQuote {
  pair: string;
  rate: number;
  timestamp: string;
}

/**
 * Fetch current price for a single symbol
 */
export async function fetchPrice(symbol: string): Promise<PriceQuote | null> {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  
  if (!apiKey) {
    console.warn("TWELVEDATA_API_KEY not set, using mock data");
    return getMockPrice(symbol);
  }

  try {
    const url = `${TWELVEDATA_BASE_URL}/price?symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch price for ${symbol}:`, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.status === "error") {
      console.error(`API error for ${symbol}:`, data.message);
      return null;
    }

    return {
      symbol,
      price: parseFloat(data.price),
      currency: "USD",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch prices for multiple symbols
 */
export async function fetchPrices(symbols: string[]): Promise<Record<string, number>> {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  const prices: Record<string, number> = {};
  
  if (!apiKey) {
    console.warn("TWELVEDATA_API_KEY not set, using mock data");
    for (const symbol of symbols) {
      const mock = getMockPrice(symbol);
      if (mock) prices[symbol] = mock.price;
    }
    return prices;
  }

  if (symbols.length === 0) return prices;

  try {
    // TwelveData allows batch requests with comma-separated symbols
    const symbolsParam = symbols.join(",");
    const url = `${TWELVEDATA_BASE_URL}/price?symbol=${symbolsParam}&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Failed to fetch prices:", response.statusText);
      return prices;
    }

    const data = await response.json();

    // Handle single symbol response (object) vs multiple symbols (object with symbol keys)
    if (symbols.length === 1) {
      if (data.price) {
        prices[symbols[0]] = parseFloat(data.price);
      }
    } else {
      for (const symbol of symbols) {
        if (data[symbol]?.price) {
          prices[symbol] = parseFloat(data[symbol].price);
        }
      }
    }

    return prices;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return prices;
  }
}

/**
 * Fetch USD/ILS exchange rate
 */
export async function fetchUSDILSRate(): Promise<number | null> {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  
  if (!apiKey) {
    console.warn("TWELVEDATA_API_KEY not set, using default rate");
    return 3.65; // Default fallback rate
  }

  try {
    const url = `${TWELVEDATA_BASE_URL}/exchange_rate?symbol=USD/ILS&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Failed to fetch USD/ILS rate:", response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.status === "error") {
      console.error("API error for USD/ILS:", data.message);
      return null;
    }

    return parseFloat(data.rate);
  } catch (error) {
    console.error("Error fetching USD/ILS rate:", error);
    return null;
  }
}

/**
 * Mock prices for development/testing
 */
function getMockPrice(symbol: string): PriceQuote | null {
  const mockPrices: Record<string, number> = {
    "AAPL": 178.50,
    "MSFT": 378.25,
    "GOOGL": 141.80,
    "AMZN": 153.40,
    "TSLA": 248.90,
    "NVDA": 495.60,
    "META": 356.20,
    "BRK.B": 362.15,
    "JPM": 172.80,
    "V": 265.30,
    "SPY": 472.50,
    "QQQ": 398.20,
    "VOO": 435.60,
    "VTI": 238.40,
    "BTC": 43500.00,
    "ETH": 2250.00,
  };

  const price = mockPrices[symbol.toUpperCase()];
  
  if (price) {
    return {
      symbol: symbol.toUpperCase(),
      price,
      currency: "USD",
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Check if API is available
 */
export function isApiConfigured(): boolean {
  return !!process.env.TWELVEDATA_API_KEY;
}


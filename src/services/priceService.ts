import { Token } from '../constants/tokens';

export interface TokenPrice {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  fdv: number;
  lastUpdated: number;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: Array<{
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
      m5: { buys: number; sells: number };
      h1: { buys: number; sells: number };
      h6: { buys: number; sells: number };
      h24: { buys: number; sells: number };
    };
    volume: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    priceChange: {
      m5: number;
      h1: number;
      h6: number;
      h24: number;
    };
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
  }>;
}

class PriceService {
  private baseUrl = 'https://api.dexscreener.com/latest/dex';
  private cache = new Map<string, { price: TokenPrice; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds cache

  // Get token prices by addresses
  async getTokenPrices(addresses: string[]): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();
    const uncachedAddresses: string[] = [];

    // Check cache first
    addresses.forEach(address => {
      const cached = this.cache.get(address.toLowerCase());
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        prices.set(address.toLowerCase(), cached.price);
      } else {
        uncachedAddresses.push(address);
      }
    });

    // Fetch uncached prices
    if (uncachedAddresses.length > 0) {
      try {
        const fetchedPrices = await this.fetchTokenPrices(uncachedAddresses);
        fetchedPrices.forEach((price, address) => {
          prices.set(address, price);
          // Cache the result
          this.cache.set(address, { price, timestamp: Date.now() });
        });
      } catch (error) {
        console.error('Error fetching prices from DexScreener:', error);
        // Return fallback prices for failed requests
        uncachedAddresses.forEach(address => {
          const fallbackPrice = this.getFallbackPrice(address);
          if (fallbackPrice) {
            prices.set(address.toLowerCase(), fallbackPrice);
          }
        });
      }
    }

    return prices;
  }

  // Get single token price
  async getTokenPrice(address: string): Promise<TokenPrice | null> {
    const prices = await this.getTokenPrices([address]);
    return prices.get(address.toLowerCase()) || null;
  }

  // Get token price by symbol (searches across multiple chains)
  async getTokenPriceBySymbol(symbol: string): Promise<TokenPrice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${symbol}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DexScreenerResponse = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        // Find the pair with highest liquidity for the symbol
        const bestPair = data.pairs
          .filter(pair => 
            pair.baseToken.symbol.toLowerCase() === symbol.toLowerCase() ||
            pair.quoteToken.symbol.toLowerCase() === symbol.toLowerCase()
          )
          .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

        if (bestPair) {
          const isBaseToken = bestPair.baseToken.symbol.toLowerCase() === symbol.toLowerCase();
          const token = isBaseToken ? bestPair.baseToken : bestPair.quoteToken;
          
          return {
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            price: parseFloat(bestPair.priceUsd) || 0,
            priceChange24h: bestPair.priceChange?.h24 || 0,
            volume24h: bestPair.volume?.h24 || 0,
            marketCap: bestPair.marketCap || 0,
            liquidity: bestPair.liquidity?.usd || 0,
            fdv: bestPair.fdv || 0,
            lastUpdated: Date.now()
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching price for symbol ${symbol}:`, error);
      return this.getFallbackPriceBySymbol(symbol);
    }
  }

  // Fetch multiple token prices from DexScreener
  private async fetchTokenPrices(addresses: string[]): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();

    try {
      // DexScreener supports multiple addresses in a single request
      const addressesParam = addresses.join(',');
      const response = await fetch(`${this.baseUrl}/tokens/${addressesParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DexScreenerResponse = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        // Group pairs by token address and find the best pair for each token
        const tokenPairs = new Map<string, typeof data.pairs>();
        
        data.pairs.forEach(pair => {
          const baseAddress = pair.baseToken.address.toLowerCase();
          const quoteAddress = pair.quoteToken.address.toLowerCase();
          
          if (addresses.some(addr => addr.toLowerCase() === baseAddress)) {
            if (!tokenPairs.has(baseAddress)) {
              tokenPairs.set(baseAddress, []);
            }
            tokenPairs.get(baseAddress)!.push(pair);
          }
          
          if (addresses.some(addr => addr.toLowerCase() === quoteAddress)) {
            if (!tokenPairs.has(quoteAddress)) {
              tokenPairs.set(quoteAddress, []);
            }
            tokenPairs.get(quoteAddress)!.push(pair);
          }
        });

        // Process each token's pairs
        tokenPairs.forEach((pairs, address) => {
          // Find the pair with highest liquidity
          const bestPair = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
          
          if (bestPair) {
            const isBaseToken = bestPair.baseToken.address.toLowerCase() === address;
            const token = isBaseToken ? bestPair.baseToken : bestPair.quoteToken;
            
            prices.set(address, {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              price: parseFloat(bestPair.priceUsd) || 0,
              priceChange24h: bestPair.priceChange?.h24 || 0,
              volume24h: bestPair.volume?.h24 || 0,
              marketCap: bestPair.marketCap || 0,
              liquidity: bestPair.liquidity?.usd || 0,
              fdv: bestPair.fdv || 0,
              lastUpdated: Date.now()
            });
          }
        });
      }
    } catch (error) {
      console.error('Error in fetchTokenPrices:', error);
      throw error;
    }

    return prices;
  }

  // Get USD value for token amount
  async getUSDValue(token: Token, amount: string): Promise<number> {
    if (!amount || parseFloat(amount) <= 0) return 0;

    try {
      const price = await this.getTokenPrice(token.address);
      if (price && price.price > 0) {
        return parseFloat(amount) * price.price;
      }

      // Try by symbol if address fails
      const priceBySymbol = await this.getTokenPriceBySymbol(token.symbol);
      if (priceBySymbol && priceBySymbol.price > 0) {
        return parseFloat(amount) * priceBySymbol.price;
      }

      // Fallback to hardcoded prices
      const fallbackPrice = this.getFallbackPriceBySymbol(token.symbol);
      if (fallbackPrice) {
        return parseFloat(amount) * fallbackPrice.price;
      }

      return 0;
    } catch (error) {
      console.error(`Error getting USD value for ${token.symbol}:`, error);
      return 0;
    }
  }

  // Get exchange rate between two tokens
  async getExchangeRate(fromToken: Token, toToken: Token): Promise<number> {
    try {
      const [fromPrice, toPrice] = await Promise.all([
        this.getTokenPrice(fromToken.address),
        this.getTokenPrice(toToken.address)
      ]);

      if (fromPrice && toPrice && fromPrice.price > 0 && toPrice.price > 0) {
        return fromPrice.price / toPrice.price;
      }

      // Try by symbol
      const [fromPriceBySymbol, toPriceBySymbol] = await Promise.all([
        this.getTokenPriceBySymbol(fromToken.symbol),
        this.getTokenPriceBySymbol(toToken.symbol)
      ]);

      if (fromPriceBySymbol && toPriceBySymbol && 
          fromPriceBySymbol.price > 0 && toPriceBySymbol.price > 0) {
        return fromPriceBySymbol.price / toPriceBySymbol.price;
      }

      // Fallback to hardcoded rates
      return this.getFallbackExchangeRate(fromToken.symbol, toToken.symbol);
    } catch (error) {
      console.error(`Error getting exchange rate ${fromToken.symbol}/${toToken.symbol}:`, error);
      return this.getFallbackExchangeRate(fromToken.symbol, toToken.symbol);
    }
  }

  // Fallback prices when API fails
  private getFallbackPrice(address: string): TokenPrice | null {
    const fallbackPrices: { [key: string]: Partial<TokenPrice> } = {
      '0x0000000000000000000000000000000000000000': { // Native SUPRA
        symbol: 'SUPRA',
        price: 0.85,
        priceChange24h: 2.5
      },
      '0xb4b7b25d5b05eee26ca81a616dfc68e069622129': { // WSUPRA
        symbol: 'WSUPRA',
        price: 0.85,
        priceChange24h: 2.5
      },
      '0x900101d06a7426441ae63e9ab3b9b0f63be145f1': { // USDT
        symbol: 'USDT',
        price: 1.00,
        priceChange24h: 0.1
      }
    };

    const fallback = fallbackPrices[address.toLowerCase()];
    if (fallback) {
      return {
        address,
        symbol: fallback.symbol || 'UNKNOWN',
        name: fallback.symbol || 'Unknown Token',
        price: fallback.price || 0,
        priceChange24h: fallback.priceChange24h || 0,
        volume24h: 100000,
        marketCap: 1000000,
        liquidity: 500000,
        fdv: 1000000,
        lastUpdated: Date.now()
      };
    }

    return null;
  }

  private getFallbackPriceBySymbol(symbol: string): TokenPrice | null {
    const fallbackPrices: { [key: string]: Partial<TokenPrice> } = {
      'SUPRA': { price: 0.85, priceChange24h: 2.5 },
      'WSUPRA': { price: 0.85, priceChange24h: 2.5 },
      'USDT': { price: 1.00, priceChange24h: 0.1 },
      'USDC': { price: 1.00, priceChange24h: 0.05 },
      'DAI': { price: 1.00, priceChange24h: 0.2 },
      'TOON': { price: 0.12, priceChange24h: 5.2 },
      'WETH': { price: 2500.00, priceChange24h: 1.8 }
    };

    const fallback = fallbackPrices[symbol.toUpperCase()];
    if (fallback) {
      return {
        address: '0x0000000000000000000000000000000000000000',
        symbol: symbol.toUpperCase(),
        name: symbol,
        price: fallback.price || 0,
        priceChange24h: fallback.priceChange24h || 0,
        volume24h: 100000,
        marketCap: 1000000,
        liquidity: 500000,
        fdv: 1000000,
        lastUpdated: Date.now()
      };
    }

    return null;
  }

  private getFallbackExchangeRate(fromSymbol: string, toSymbol: string): number {
    const rates: { [key: string]: number } = {
      'SUPRA-USDT': 0.85,
      'USDT-SUPRA': 1.18,
      'SUPRA-USDC': 0.84,
      'USDC-SUPRA': 1.19,
      'WSUPRA-SUPRA': 1.0,
      'SUPRA-WSUPRA': 1.0,
      'USDT-USDC': 0.999,
      'USDC-USDT': 1.001,
      'TOON-SUPRA': 0.141, // 0.12 / 0.85
      'SUPRA-TOON': 7.08   // 0.85 / 0.12
    };

    const key = `${fromSymbol.toUpperCase()}-${toSymbol.toUpperCase()}`;
    return rates[key] || 1.0;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const priceService = new PriceService();
export default priceService;
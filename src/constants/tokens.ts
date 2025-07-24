export interface Token {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
}

// Multi-network token configurations
export const TOKENS_BY_NETWORK = {
  // Supra Mainnet (Chain ID: 7)
  7: {
    NATIVE: {
      name: "Supra",
      symbol: "SUPRA",
      address: "0x0000000000000000000000000000000000000000",
      chainId: 7,
      decimals: 18,
      logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
    },
    WSUPRA: {
      name: "Wrapped Supra",
      symbol: "WSUPRA",
      address: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129", // Update with mainnet address
      chainId: 7,
      decimals: 18,
      logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
    },
    USDT: {
      name: "Tether USD",
      symbol: "USDT",
      address: "0x900101d06a7426441ae63e9ab3b9b0f63be145f1", // Update with mainnet address
      chainId: 7,
      decimals: 6,
      logoURI: "https://pipiswap.finance/images/tokens/0x900101d06a7426441ae63e9ab3b9b0f63be145f1.png"
    },
    TOON: {
      name: "ToonSwap Token",
      symbol: "TOON",
      address: "0x1234567890123456789012345678901234567890", // Update with mainnet address
      chainId: 7,
      decimals: 18,
      logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751326180150-96821ac49491ed824047c2ffa1217f78.png"
    }
  },
  // Supra Testnet (Chain ID: 8)
  8: {
    NATIVE: {
      name: "Supra",
      symbol: "SUPRA",
      address: "0x0000000000000000000000000000000000000000",
      chainId: 8,
      decimals: 18,
      logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
    },
    WSUPRA: {
      name: "Wrapped Supra",
      symbol: "WSUPRA",
      address: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129",
      chainId: 8,
      decimals: 18,
      logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
    },
    USDT: {
      name: "Tether USD",
      symbol: "USDT",
      address: "0x900101d06a7426441ae63e9ab3b9b0f63be145f1",
      chainId: 8,
      decimals: 6,
      logoURI: "https://pipiswap.finance/images/tokens/0x900101d06a7426441ae63e9ab3b9b0f63be145f1.png"
    },
    TOON: {
      name: "ToonSwap Token",
      symbol: "TOON",
      address: "0x1234567890123456789012345678901234567890",
      chainId: 8,
      decimals: 18,
      logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751326180150-96821ac49491ed824047c2ffa1217f78.png"
    }
  }
};

// Helper functions to get tokens for current network
export const getTokensForNetwork = (chainId: number): Token[] => {
  const networkTokens = TOKENS_BY_NETWORK[chainId as keyof typeof TOKENS_BY_NETWORK];
  if (!networkTokens) {
    // Fallback to testnet tokens
    return Object.values(TOKENS_BY_NETWORK[8]);
  }
  return Object.values(networkTokens);
};

export const getNativeToken = (chainId: number): Token => {
  const networkTokens = TOKENS_BY_NETWORK[chainId as keyof typeof TOKENS_BY_NETWORK];
  return networkTokens?.NATIVE || TOKENS_BY_NETWORK[8].NATIVE;
};

export const getWrappedToken = (chainId: number): Token => {
  const networkTokens = TOKENS_BY_NETWORK[chainId as keyof typeof TOKENS_BY_NETWORK];
  return networkTokens?.WSUPRA || TOKENS_BY_NETWORK[8].WSUPRA;
};

export const getUSDTToken = (chainId: number): Token => {
  const networkTokens = TOKENS_BY_NETWORK[chainId as keyof typeof TOKENS_BY_NETWORK];
  return networkTokens?.USDT || TOKENS_BY_NETWORK[8].USDT;
};

export const getToonToken = (chainId: number): Token => {
  const networkTokens = TOKENS_BY_NETWORK[chainId as keyof typeof TOKENS_BY_NETWORK];
  return networkTokens?.TOON || TOKENS_BY_NETWORK[8].TOON;
};

// Legacy exports for backward compatibility (default to testnet)
export const NATIVE_TOKEN: Token = TOKENS_BY_NETWORK[8].NATIVE;
export const WSUPRA_TOKEN: Token = TOKENS_BY_NETWORK[8].WSUPRA;
export const USDT_TOKEN: Token = TOKENS_BY_NETWORK[8].USDT;
export const TOON_TOKEN: Token = TOKENS_BY_NETWORK[8].TOON;

// Dynamic token list based on current network
export const DEFAULT_TOKENS: Token[] = getTokensForNetwork(8); // Default to testnet

// Token lists by category
export const STABLECOINS: Token[] = [
  USDT_TOKEN
];

export const NATIVE_TOKENS: Token[] = [
  NATIVE_TOKEN,
  WSUPRA_TOKEN
];

// Helper functions
export const getTokenByAddress = (address: string): Token | undefined => {
  return DEFAULT_TOKENS.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return DEFAULT_TOKENS.find(token => 
    token.symbol.toLowerCase() === symbol.toLowerCase()
  );
};

export const isNativeToken = (token: Token): boolean => {
  return token.address === "0x0000000000000000000000000000000000000000";
};

export const formatTokenAmount = (amount: string, decimals: number): string => {
  const num = parseFloat(amount);
  if (num === 0) return '0.0000';
  if (num < 0.0001) return '< 0.0001';
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
export interface Token {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
}

// Native SUPRA token
export const NATIVE_TOKEN: Token = {
  name: "Supra",
  symbol: "SUPRA",
  address: "0x0000000000000000000000000000000000000000", // Native token address
  chainId: 8,
  decimals: 18,
  logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
};

// Wrapped SUPRA token
export const WSUPRA_TOKEN: Token = {
  name: "Wrapped Supra",
  symbol: "WSUPRA",
  address: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129",
  chainId: 8,
  decimals: 18,
  logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
};

// USDT token on Supra testnet
export const USDT_TOKEN: Token = {
  name: "Tether USD",
  symbol: "USDT",
  address: "0x900101d06a7426441ae63e9ab3b9b0f63be145f1",
  chainId: 8,
  decimals: 6,
  logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png"
};


// ToonSwap native token
export const TOON_TOKEN: Token = {
  name: "ToonSwap Token",
  symbol: "TOON",
  address: "0x1234567890123456789012345678901234567890",
  chainId: 8,
  decimals: 18,
  logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751326180150-96821ac49491ed824047c2ffa1217f78.png"
};

// DAI token on Supra testnet
export const DAI_TOKEN: Token = {
  name: "Dai Stablecoin",
  symbol: "DAI",
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  chainId: 8,
  decimals: 18,
  logoURI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png"
};

// WETH token on Supra testnet
export const WETH_TOKEN: Token = {
  name: "Wrapped Ether",
  symbol: "WETH",
  address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  chainId: 8,
  decimals: 18,
  logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
};

// All available tokens
export const DEFAULT_TOKENS: Token[] = [
  NATIVE_TOKEN,    // SUPRA
  WSUPRA_TOKEN,    // WSUPRA
  USDT_TOKEN,      // USDT
  USDC_TOKEN,      // USDC
  TOON_TOKEN,      // TOON
  DAI_TOKEN,       // DAI
  WETH_TOKEN       // WETH
];

// Token lists by category
export const STABLECOINS: Token[] = [
  USDT_TOKEN,
  USDC_TOKEN,
  DAI_TOKEN
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
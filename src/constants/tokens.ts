export interface Token {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
}

export const NATIVE_TOKEN: Token = {
  name: "Supra",
  symbol: "SUPRA",
  address: "0x0000000000000000000000000000000000000000",
  chainId: 8, // Updated to match StarKey's actual chain ID
  decimals: 18,
  logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
};

export const WSUPRA_TOKEN: Token = {
  name: "Wrapped Supra",
  symbol: "WSUPRA",
  address: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129",
  chainId: 8, // Updated to match StarKey's actual chain ID
  decimals: 18,
  logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751321928620-ab24aa4fccb165dc3ea539fa6f40d2c9.png"
};

export const USDT_TOKEN: Token = {
  name: "USDT Token",
  symbol: "USDT",
  address: "0x900101d06a7426441ae63e9ab3b9b0f63be145f1",
  chainId: 8, // Updated to match StarKey's actual chain ID
  decimals: 6,
  logoURI: "https://pipiswap.finance/images/tokens/0x900101d06a7426441ae63e9ab3b9b0f63be145f1.png"
};

export const TOON_TOKEN: Token = {
  name: "ToonSwap Token",
  symbol: "TOON",
  address: "0x1234567890123456789012345678901234567890",
  chainId: 8, // Updated to match StarKey's actual chain ID
  decimals: 18,
  logoURI: "https://photos.pinksale.finance/file/pinksale-logo-upload/1751326180150-96821ac49491ed824047c2ffa1217f78.png"
};

export const DEFAULT_TOKENS: Token[] = [
  NATIVE_TOKEN,    // SUPRA
  WSUPRA_TOKEN,    // WSUPRA
  USDT_TOKEN,      // USDT
  TOON_TOKEN       // TOON
];
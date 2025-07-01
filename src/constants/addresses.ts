export const CONTRACT_ADDRESSES = {
  FACTORY: "0x30F2d7b7413c9A774FB92Ff2c952C9501363dd22",
  ROUTER: "0x99b5a05bCceC10f52d1fF139b5AAF852ec748Fae",
  WSUPRA: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129",
  MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11"
};

// Updated to match Supra Testnet actual configuration
export const SUPRA_CHAIN = {
  id: 8, // Supra Testnet Chain ID
  name: "Supra Testnet",
  network: "supra-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Supra",
    symbol: "SUPRA"
  },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.supra.com"] },
    public: { http: ["https://rpc-testnet.supra.com"] }
  },
  blockExplorers: {
    default: { name: "SupraScan", url: "https://testnet-explorer.supra.com" }
  },
  testnet: true
};

// Network configuration for wallet integration
export const SUPRA_NETWORK_CONFIG = {
  chainId: `0x${SUPRA_CHAIN.id.toString(16)}`, // 0x8
  chainName: SUPRA_CHAIN.name,
  nativeCurrency: SUPRA_CHAIN.nativeCurrency,
  rpcUrls: SUPRA_CHAIN.rpcUrls.default.http,
  blockExplorerUrls: [SUPRA_CHAIN.blockExplorers.default.url]
};
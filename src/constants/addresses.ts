// Supra Mainnet Configuration
export const SUPRA_MAINNET = {
  id: 7, // Supra Mainnet Chain ID
  name: "Supra Mainnet",
  network: "supra-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Supra",
    symbol: "SUPRA"
  },
  rpcUrls: {
    default: { http: ["https://rpc-mainnet.supra.com"] },
    public: { http: ["https://rpc-mainnet.supra.com"] }
  },
  blockExplorers: {
    default: { name: "SupraScan", url: "https://explorer.supra.com" }
  },
  testnet: false
};

// Supra Testnet Configuration
export const SUPRA_TESTNET = {
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

// Supported Networks
export const SUPPORTED_NETWORKS = {
  [SUPRA_MAINNET.id]: SUPRA_MAINNET,
  [SUPRA_TESTNET.id]: SUPRA_TESTNET
};

// Default network (can be changed based on environment)
export const DEFAULT_NETWORK = SUPRA_TESTNET; // Change to SUPRA_MAINNET for production

// Legacy export for backward compatibility
export const SUPRA_CHAIN = DEFAULT_NETWORK;

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  [SUPRA_MAINNET.id]: {
    FACTORY: "0x30F2d7b7413c9A774FB92Ff2c952C9501363dd22", // Will be updated when mainnet is available
    ROUTER: "0x99b5a05bCceC10f52d1fF139b5AAF852ec748Fae", // Will be updated when mainnet is available
    WSUPRA: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129",
    MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11"
  },
  [SUPRA_TESTNET.id]: {
    // REAL SUPRA TESTNET CONTRACTS - PROVIDED BY USER
    FACTORY: "0x30F2d7b7413c9A774FB92Ff2c952C9501363dd22",
    ROUTER: "0x99b5a05bCceC10f52d1fF139b5AAF852ec748Fae",
    WSUPRA: "0xb4b7b25d5b05eee26ca81a616dfc68e069622129",
    MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11"
  }
};

// Helper functions
export const getNetworkConfig = (chainId: number) => {
  return SUPPORTED_NETWORKS[chainId] || DEFAULT_NETWORK;
};

export const getContractAddresses = (chainId: number) => {
  return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[DEFAULT_NETWORK.id];
};

export const isSupraNetwork = (chainId: number): boolean => {
  return chainId === SUPRA_MAINNET.id || chainId === SUPRA_TESTNET.id;
};

export const getNetworkDisplayName = (chainId: number): string => {
  const network = getNetworkConfig(chainId);
  return network.name;
};

// Network configuration for wallet integration
export const getNetworkConfigForWallet = (chainId: number) => {
  const network = getNetworkConfig(chainId);
  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: network.rpcUrls.default.http,
    blockExplorerUrls: [network.blockExplorers.default.url]
  };
};

// Legacy export for backward compatibility
export const SUPRA_NETWORK_CONFIG = getNetworkConfigForWallet(DEFAULT_NETWORK.id);
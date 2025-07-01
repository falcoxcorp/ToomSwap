interface StarKeyProvider {
  connect: () => Promise<string[]>;
  disconnect: () => Promise<void>;
  account: () => Promise<string[]>;
  sendTransaction: (transaction: {
    data?: string;
    from: string;
    to: string;
    value: string;
  }) => Promise<string>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  selectedAddress: string | null;
  isStarkey: boolean;
}

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress: string | null;
  isStarkey?: boolean;
  providers?: EthereumProvider[];
}

interface Window {
  starkey?: {
    supra?: StarKeyProvider;
    isStarkey?: boolean;
  };
  ethereum?: EthereumProvider;
}
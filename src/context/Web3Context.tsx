import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  SUPRA_MAINNET, 
  SUPRA_TESTNET, 
  SUPPORTED_NETWORKS, 
  DEFAULT_NETWORK,
  getNetworkConfig,
  getNetworkConfigForWallet,
  isSupraNetwork,
  getNetworkDisplayName
} from '../constants/addresses';
import { getTokensForNetwork } from '../constants/tokens';
import toast from 'react-hot-toast';

type WalletType = 'starkey' | null;

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  walletType: WalletType;
  balance: string;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  switchToNetwork: (chainId: number) => Promise<void>;
  getSupportedNetworks: () => typeof SUPPORTED_NETWORKS;
  getCurrentNetworkTokens: () => any[];
  switchToSupraNetwork: () => Promise<void>;
  getTokenBalance: (tokenAddress: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [balance, setBalance] = useState<string>('0.0000');
  const [pendingNetworkRequest, setPendingNetworkRequest] = useState(false);

  // Enhanced StarKey detection with multiple methods
  const isStarkeyInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Method 1: Check for window.starkey
    if (window.starkey && window.starkey.supra) {
      console.log('StarKey detected via window.starkey');
      return true;
    }
    
    // Method 2: Check for ethereum provider with StarKey identifier
    if (window.ethereum && window.ethereum.isStarkey) {
      console.log('StarKey detected via window.ethereum.isStarkey');
      return true;
    }
    
    // Method 3: Check for StarKey in ethereum providers array
    if (window.ethereum && window.ethereum.providers) {
      const hasStarkey = window.ethereum.providers.some((provider: any) => provider.isStarkey);
      if (hasStarkey) {
        console.log('StarKey detected in providers array');
        return true;
      }
    }
    
    // Method 4: Check for StarKey specific methods
    if (window.ethereum && typeof window.ethereum.request === 'function') {
      try {
        // Try to detect StarKey by checking for specific methods
        if (window.ethereum.isStarkey !== undefined) {
          console.log('StarKey detected via isStarkey property');
          return true;
        }
      } catch (error) {
        console.log('Error checking StarKey methods:', error);
      }
    }
    
    return false;
  };

  // Get StarKey provider with enhanced detection
  const getStarkeyProvider = () => {
    if (typeof window === 'undefined') return null;
    
    console.log('Attempting to get StarKey provider...');
    
    // Method 1: Direct StarKey provider
    if (window.starkey && window.starkey.supra) {
      console.log('Using window.starkey.supra provider');
      return window.starkey.supra;
    }
    
    // Method 2: StarKey through ethereum
    if (window.ethereum && window.ethereum.isStarkey) {
      console.log('Using window.ethereum (StarKey) provider');
      return window.ethereum;
    }
    
    // Method 3: StarKey from providers array
    if (window.ethereum && window.ethereum.providers) {
      const starkeyProvider = window.ethereum.providers.find((provider: any) => provider.isStarkey);
      if (starkeyProvider) {
        console.log('Using StarKey from providers array');
        return starkeyProvider;
      }
    }
    
    // Method 4: Fallback to main ethereum provider if it might be StarKey
    if (window.ethereum && typeof window.ethereum.request === 'function') {
      console.log('Using fallback ethereum provider (might be StarKey)');
      return window.ethereum;
    }
    
    console.log('No StarKey provider found');
    return null;
  };

  // Validate and normalize Ethereum address
  const validateAndNormalizeAddress = (address: string): string | null => {
    if (!address || typeof address !== 'string') {
      console.log('Invalid address type:', typeof address, address);
      return null;
    }

    address = address.trim();

    if (!address.startsWith('0x')) {
      console.log('Address does not start with 0x:', address);
      return null;
    }

    if (address.length === 42) {
      try {
        return ethers.utils.getAddress(address);
      } catch (error) {
        console.log('Invalid Ethereum address format:', address, error);
        return null;
      }
    }

    if (address.length > 42) {
      console.log('Address too long for Ethereum format:', address.length, 'characters');
      const hexPart = address.slice(2);
      if (hexPart.length >= 40) {
        const possibleAddress = '0x' + hexPart.slice(-40);
        try {
          const normalizedAddress = ethers.utils.getAddress(possibleAddress);
          console.log('Extracted Ethereum address from long format:', normalizedAddress);
          return normalizedAddress;
        } catch (error) {
          console.log('Could not extract valid Ethereum address:', error);
        }
      }
    }

    console.log('Address format not supported:', address);
    return null;
  };

  // Normalize chainId from various formats
  const normalizeChainId = (chainIdResult: any): string => {
    console.log('Normalizing chainId:', chainIdResult, typeof chainIdResult);
    
    if (typeof chainIdResult === 'string' && chainIdResult.startsWith('0x')) {
      return chainIdResult;
    }
    
    if (typeof chainIdResult === 'object' && chainIdResult !== null) {
      if (chainIdResult.chainId !== undefined) {
        const chainId = chainIdResult.chainId;
        const numChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : Number(chainId);
        return `0x${numChainId.toString(16)}`;
      }
    }
    
    const numChainId = typeof chainIdResult === 'string' ? parseInt(chainIdResult, 10) : Number(chainIdResult);
    if (!isNaN(numChainId)) {
      return `0x${numChainId.toString(16)}`;
    }
    
    console.warn('Could not normalize chainId, using default Supra chain');
    return `0x${SUPRA_CHAIN.id.toString(16)}`;
  };

  // Create StarKey adapter with enhanced EIP-1193 compliance
  const createStarkeyAdapter = (starkeyProvider: any) => {
    console.log('Creating enhanced StarKey adapter for provider:', starkeyProvider);
    
    const adapter = {
      request: async ({ method, params = [] }: { method: string; params?: any[] }) => {
        console.log(`StarKey adapter request: ${method}`, params);
        
        try {
          switch (method) {
            case 'eth_requestAccounts':
              if (typeof starkeyProvider.connect === 'function') {
                const accounts = await starkeyProvider.connect();
                console.log('StarKey connect result:', accounts);
                
                if (Array.isArray(accounts)) {
                  const validatedAccounts = accounts
                    .map(addr => validateAndNormalizeAddress(addr))
                    .filter(addr => addr !== null);
                  
                  if (validatedAccounts.length === 0) {
                    throw new Error('No valid Ethereum addresses found in StarKey response');
                  }
                  
                  console.log('Validated accounts:', validatedAccounts);
                  return validatedAccounts;
                }
                
                throw new Error('Invalid accounts format from StarKey');
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                throw new Error('StarKey connect method not available');
              }
              
            case 'eth_accounts':
              if (typeof starkeyProvider.account === 'function') {
                const accounts = await starkeyProvider.account();
                console.log('StarKey account result:', accounts);
                
                if (Array.isArray(accounts)) {
                  const validatedAccounts = accounts
                    .map(addr => validateAndNormalizeAddress(addr))
                    .filter(addr => addr !== null);
                  
                  console.log('Validated existing accounts:', validatedAccounts);
                  return validatedAccounts;
                }
                
                return [];
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                return [];
              }
              
            case 'eth_chainId':
              if (typeof starkeyProvider.getChainId === 'function') {
                const chainIdResult = await starkeyProvider.getChainId();
                console.log('StarKey chainId result:', chainIdResult);
                const normalizedChainId = normalizeChainId(chainIdResult);
                console.log('Normalized chainId:', normalizedChainId);
                return normalizedChainId;
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                return `0x${SUPRA_CHAIN.id.toString(16)}`;
              }
              
            case 'net_version':
              if (typeof starkeyProvider.getChainId === 'function') {
                const chainIdResult = await starkeyProvider.getChainId();
                const normalizedChainId = normalizeChainId(chainIdResult);
                return parseInt(normalizedChainId, 16).toString();
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                return SUPRA_CHAIN.id.toString();
              }
              
            case 'eth_getBalance':
              if (typeof starkeyProvider.getBalance === 'function') {
                return await starkeyProvider.getBalance(params[0], params[1] || 'latest');
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                return '0x0';
              }
              
            case 'eth_sendTransaction':
              if (typeof starkeyProvider.sendTransaction === 'function') {
                return await starkeyProvider.sendTransaction(params[0]);
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                throw new Error('StarKey sendTransaction method not available');
              }
              
            case 'personal_sign':
              if (typeof starkeyProvider.signMessage === 'function') {
                return await starkeyProvider.signMessage(params[0], params[1]);
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                throw new Error('StarKey signMessage method not available');
              }
              
            case 'wallet_switchEthereumChain':
              if (typeof starkeyProvider.switchNetwork === 'function') {
                return await starkeyProvider.switchNetwork(params[0].chainId);
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                throw new Error('StarKey switchNetwork method not available');
              }
              
            case 'wallet_addEthereumChain':
              if (typeof starkeyProvider.addNetwork === 'function') {
                return await starkeyProvider.addNetwork(params[0]);
              } else if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                throw new Error('StarKey addNetwork method not available');
              }
              
            default:
              if (typeof starkeyProvider.request === 'function') {
                return await starkeyProvider.request({ method, params });
              } else {
                throw new Error(`Method ${method} not supported by StarKey adapter`);
              }
          }
        } catch (error) {
          console.error(`StarKey adapter error for ${method}:`, error);
          throw error;
        }
      },
      
      on: (event: string, callback: (...args: any[]) => void) => {
        console.log(`StarKey adapter: Adding listener for ${event}`);
        if (typeof starkeyProvider.on === 'function') {
          starkeyProvider.on(event, callback);
        } else if (typeof starkeyProvider.addEventListener === 'function') {
          starkeyProvider.addEventListener(event, callback);
        }
      },
      
      removeListener: (event: string, callback: (...args: any[]) => void) => {
        console.log(`StarKey adapter: Removing listener for ${event}`);
        if (typeof starkeyProvider.removeListener === 'function') {
          starkeyProvider.removeListener(event, callback);
        } else if (typeof starkeyProvider.removeEventListener === 'function') {
          starkeyProvider.removeEventListener(event, callback);
        }
      },
      
      send: function(method: string, params: any[]) {
        return this.request({ method, params });
      },
      
      sendAsync: function(payload: any, callback: any) {
        this.request(payload)
          .then((result: any) => callback(null, { result }))
          .catch((error: any) => callback(error));
      },
      
      isStarkey: true,
      isMetaMask: false,
      selectedAddress: null,
      networkVersion: SUPRA_CHAIN.id.toString(),
      chainId: `0x${SUPRA_CHAIN.id.toString(16)}`
    };
    
    console.log('Enhanced StarKey adapter created:', adapter);
    return adapter;
  };

  // Get token balance
  const getTokenBalance = async (tokenAddress: string): Promise<string> => {
    if (!provider || !account) return '0.0000';

    try {
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // Native token balance
        const balance = await provider.getBalance(account);
        return ethers.utils.formatEther(balance);
      } else {
        // ERC20 token balance
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)'
          ],
          provider
        );
        
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(account),
          tokenContract.decimals()
        ]);
        
        return ethers.utils.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0.0000';
    }
  };

  // Update balance
  const updateBalance = async () => {
    if (!provider || !account) return;

    try {
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.utils.formatEther(balance);
      setBalance(formattedBalance);
    } catch (error) {
      console.error('Error updating balance:', error);
      setBalance('0.0000');
    }
  };

  // Connect wallet with enhanced error handling
  const connectWallet = async (preferredWalletType?: WalletType) => {
    setIsConnecting(true);
    
    try {
      console.log('Starting wallet connection...');
      
      // Wait for StarKey to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isStarkeyInstalled()) {
        console.log('StarKey not detected');
        toast.error('StarKey wallet is not installed. Please install it from the Chrome Web Store.');
        return;
      }

      const rawProvider = getStarkeyProvider();
      if (!rawProvider) {
        console.log('No wallet provider found');
        toast.error('Failed to connect to StarKey wallet. Please ensure it is properly installed and unlocked.');
        return;
      }

      console.log('Raw provider found:', rawProvider);

      const walletProvider = createStarkeyAdapter(rawProvider);
      console.log('StarKey adapter created');

      console.log('Requesting accounts...');

      let accounts: string[] = [];
      
      try {
        accounts = await walletProvider.request({
          method: 'eth_requestAccounts'
        });
        console.log('Accounts received:', accounts);
      } catch (connectError: any) {
        console.log('Connection failed:', connectError);
        
        if (connectError.code === 4001) {
          toast.error('Connection rejected by user');
        } else if (connectError.code === -32002) {
          toast.error('Please check StarKey - there may be a pending request to approve');
        } else {
          toast.error(`Failed to connect: ${connectError.message || 'Unknown error'}`);
        }
        return;
      }

      if (!accounts || accounts.length === 0) {
        console.log('No accounts returned');
        toast.error('No accounts found in StarKey wallet. Please create or unlock your wallet.');
        return;
      }

      const primaryAccount = accounts[0];
      if (!ethers.utils.isAddress(primaryAccount)) {
        console.log('Invalid account address format:', primaryAccount);
        toast.error('Invalid account address format from StarKey wallet.');
        return;
      }

      console.log('Creating Web3 provider...');
      
      const web3Provider = new ethers.providers.Web3Provider(walletProvider, 'any');
      console.log('Provider created');
      
      try {
        console.log('Testing provider connection...');
        
        const network = await web3Provider.getNetwork();
        console.log('Network detected:', network);
        
        const web3Signer = web3Provider.getSigner();
        console.log('Signer created');
        
        // Set state
        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(primaryAccount);
        setChainId(network.chainId);
        setWalletType('starkey');

        // Update balance
        try {
          const balance = await web3Provider.getBalance(primaryAccount);
          const formattedBalance = ethers.utils.formatEther(balance);
          setBalance(formattedBalance);
        } catch (balanceError) {
          console.log('Could not fetch balance:', balanceError);
          setBalance('0.0000');
        }

        // Check network
        if (network.chainId !== SUPRA_CHAIN.id) {
          console.log('Wrong network detected, current:', network.chainId, 'expected:', SUPRA_CHAIN.id);
          toast.success('Connected to StarKey! Please switch to Supra network.');
        } else {
          toast.success('Successfully connected to StarKey wallet on Supra network!');
        }
      } catch (providerError: any) {
        console.error('Provider setup failed:', providerError);
        
        if (providerError.message && providerError.message.includes('unsupported provider')) {
          toast.error('StarKey provider format not supported. Please try refreshing the page.');
        } else if (providerError.message && providerError.message.includes('network')) {
          toast.error('Network configuration error. Please check your StarKey network settings.');
        } else {
          toast.error(`Failed to setup wallet connection: ${providerError.message || 'Unknown error'}`);
        }
        return;
      }

    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else if (error.code === -32002) {
        toast.error('Please check StarKey - there may be a pending request to approve');
      } else {
        toast.error(`Failed to connect to StarKey wallet: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch to Supra network
  const switchToNetwork = async (targetChainId: number) => {
    const currentProvider = getStarkeyProvider();
    if (!currentProvider || pendingNetworkRequest) return;

    const networkConfig = getNetworkConfig(targetChainId);
    if (!networkConfig) {
      toast.error('Unsupported network');
      return;
    }

    setPendingNetworkRequest(true);
    try {
      console.log(`Switching to ${networkConfig.name}...`);
      
      const adapter = createStarkeyAdapter(currentProvider);
      
      await adapter.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      });
      
      toast.success(`Successfully switched to ${networkConfig.name}!`);
    } catch (switchError: any) {
      console.log('Switch network error:', switchError);
      
      if (switchError.code === 4902) {
        try {
          console.log(`Adding ${networkConfig.name}...`);
          
          const adapter = createStarkeyAdapter(currentProvider);
          const walletConfig = getNetworkConfigForWallet(targetChainId);
          
          await adapter.request({
            method: 'wallet_addEthereumChain',
            params: [walletConfig]
          });
          
          toast.success(`${networkConfig.name} added and switched successfully!`);
        } catch (addError: any) {
          console.error(`Failed to add ${networkConfig.name}:`, addError);
          
          if (addError.code === 4001) {
            toast.error(`Please approve the request to add ${networkConfig.name} in StarKey`);
          } else {
            toast.error(`Failed to add ${networkConfig.name} to StarKey`);
          }
        }
      } else if (switchError.code === 4001) {
        toast.error('Please approve the network switch in StarKey');
      } else {
        console.error(`Failed to switch to ${networkConfig.name}:`, switchError);
        toast.error(`Failed to switch to ${networkConfig.name}`);
      }
    } finally {
      setPendingNetworkRequest(false);
    }
  };

  // Legacy function for backward compatibility
  const switchToSupraNetwork = async () => {
    await switchToNetwork(DEFAULT_NETWORK.id);
  };

  // Get supported networks
  const getSupportedNetworks = () => {
    return SUPPORTED_NETWORKS;
  };

  // Get current network tokens
  const getCurrentNetworkTokens = () => {
    return getTokensForNetwork(chainId || DEFAULT_NETWORK.id);
  };
  // Disconnect wallet
  const disconnectWallet = async () => {
    console.log('Disconnecting wallet...');
    
    if (walletType === 'starkey') {
      const starkeyProvider = getStarkeyProvider();
      if (starkeyProvider && typeof starkeyProvider.disconnect === 'function') {
        try {
          await starkeyProvider.disconnect();
        } catch (error) {
          console.error('Error disconnecting from StarKey:', error);
        }
      }
    }

    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setWalletType(null);
    setBalance('0.0000');
    toast.success('Wallet disconnected');
  };

  // Event handlers
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const validatedAccount = validateAndNormalizeAddress(accounts[0]);
        if (validatedAccount) {
          setAccount(validatedAccount);
          updateBalance();
        } else {
          console.error('Invalid account format in accounts changed event');
          disconnectWallet();
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      const normalizedChainId = normalizeChainId(chainId);
      const newChainId = parseInt(normalizedChainId, 16);
      setChainId(newChainId);
      
      const networkConfig = getNetworkConfig(newChainId);
      
      if (isSupraNetwork(newChainId)) {
        toast.success(`Switched to ${networkConfig.name}!`);
      } else {
        toast.warning('Please switch to a supported Supra network for full functionality');
      }
    };

    const setupEventListeners = () => {
      if (walletType === 'starkey') {
        const starkeyProvider = getStarkeyProvider();
        if (starkeyProvider) {
          console.log('Setting up StarKey event listeners');
          const adapter = createStarkeyAdapter(starkeyProvider);
          adapter.on('accountsChanged', handleAccountsChanged);
          adapter.on('chainChanged', handleChainChanged);
        }
      }
    };

    const removeEventListeners = () => {
      if (walletType === 'starkey') {
        const starkeyProvider = getStarkeyProvider();
        if (starkeyProvider) {
          console.log('Removing StarKey event listeners');
          const adapter = createStarkeyAdapter(starkeyProvider);
          adapter.removeListener('accountsChanged', handleAccountsChanged);
          adapter.removeListener('chainChanged', handleChainChanged);
        }
      }
    };

    if (walletType) {
      setupEventListeners();
    }

    // Check for existing connection
    const checkExistingConnection = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (isStarkeyInstalled()) {
          const starkeyProvider = getStarkeyProvider();
          if (starkeyProvider) {
            try {
              console.log('Checking for existing connection...');
              
              const adapter = createStarkeyAdapter(starkeyProvider);
              const accounts = await adapter.request({ method: 'eth_accounts' });
              
              if (accounts && accounts.length > 0) {
                console.log('Found existing connection, auto-connecting...');
                
                const validatedAccount = validateAndNormalizeAddress(accounts[0]);
                if (!validatedAccount) {
                  console.log('Invalid existing account format, skipping auto-connect');
                  return;
                }
                
                const web3Provider = new ethers.providers.Web3Provider(adapter, 'any');
                const web3Signer = web3Provider.getSigner();
                const network = await web3Provider.getNetwork();

                setProvider(web3Provider);
                setSigner(web3Signer);
                setAccount(validatedAccount);
                setChainId(network.chainId);
                setWalletType('starkey');
                
                // Update balance
                try {
                  const balance = await web3Provider.getBalance(validatedAccount);
                  const formattedBalance = ethers.utils.formatEther(balance);
                  setBalance(formattedBalance);
                } catch (balanceError) {
                  console.log('Could not fetch balance on auto-connect:', balanceError);
                  setBalance('0.0000');
                }
                
                console.log('Auto-connected to StarKey wallet');
              }
            } catch (error) {
              console.log('No existing connection found:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();

    return removeEventListeners;
  }, [walletType]);

  // Update balance when account or provider changes
  useEffect(() => {
    if (provider && account) {
      updateBalance();
      
      // Set up balance update interval
      const interval = setInterval(updateBalance, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [provider, account]);

  return (
    <Web3Context.Provider value={{
      provider,
      signer,
      account,
      chainId,
      isConnecting,
      walletType,
      balance,
      connectWallet,
      disconnectWallet,
      switchToNetwork,
      getSupportedNetworks,
      getCurrentNetworkTokens,
      switchToSupraNetwork,
      getTokenBalance
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
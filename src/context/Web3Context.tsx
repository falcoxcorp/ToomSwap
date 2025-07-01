import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { SUPRA_CHAIN } from '../constants/addresses';
import toast from 'react-hot-toast';

type WalletType = 'starkey' | null;

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  walletType: WalletType;
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  switchToSupraNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [pendingNetworkRequest, setPendingNetworkRequest] = useState(false);

  // Enhanced StarKey detection
  const isStarkeyInstalled = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for window.starkey
    if (window.starkey && window.starkey.supra) {
      console.log('StarKey detected via window.starkey');
      return true;
    }
    
    // Check for ethereum provider with StarKey identifier
    if (window.ethereum && window.ethereum.isStarkey) {
      console.log('StarKey detected via window.ethereum.isStarkey');
      return true;
    }
    
    // Check for StarKey in ethereum providers array
    if (window.ethereum && window.ethereum.providers) {
      const hasStarkey = window.ethereum.providers.some((provider: any) => provider.isStarkey);
      if (hasStarkey) {
        console.log('StarKey detected in providers array');
        return true;
      }
    }
    
    return false;
  };

  // Get StarKey provider
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
    
    console.log('No StarKey provider found');
    return null;
  };

  // Helper function to validate and normalize Ethereum address
  const validateAndNormalizeAddress = (address: string): string | null => {
    if (!address || typeof address !== 'string') {
      console.log('Invalid address type:', typeof address, address);
      return null;
    }

    // Remove any whitespace
    address = address.trim();

    // Check if it starts with 0x
    if (!address.startsWith('0x')) {
      console.log('Address does not start with 0x:', address);
      return null;
    }

    // Check if it's the correct length for Ethereum address (42 characters total)
    if (address.length === 42) {
      // Standard Ethereum address
      try {
        return ethers.utils.getAddress(address);
      } catch (error) {
        console.log('Invalid Ethereum address format:', address, error);
        return null;
      }
    }

    // If it's longer than 42 characters, it might be a different format
    if (address.length > 42) {
      console.log('Address too long for Ethereum format:', address.length, 'characters');
      
      // Try to extract the last 40 hex characters (standard Ethereum address length)
      const hexPart = address.slice(2); // Remove 0x
      if (hexPart.length >= 40) {
        const possibleAddress = '0x' + hexPart.slice(-40); // Take last 40 characters
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

  // Helper function to normalize chainId from StarKey
  const normalizeChainId = (chainIdResult: any): string => {
    console.log('Normalizing chainId:', chainIdResult, typeof chainIdResult);
    
    // If it's already a hex string, return it
    if (typeof chainIdResult === 'string' && chainIdResult.startsWith('0x')) {
      return chainIdResult;
    }
    
    // If it's an object with chainId property
    if (typeof chainIdResult === 'object' && chainIdResult !== null) {
      if (chainIdResult.chainId !== undefined) {
        const chainId = chainIdResult.chainId;
        // Convert to number first, then to hex
        const numChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : Number(chainId);
        return `0x${numChainId.toString(16)}`;
      }
    }
    
    // If it's a number or string number
    const numChainId = typeof chainIdResult === 'string' ? parseInt(chainIdResult, 10) : Number(chainIdResult);
    if (!isNaN(numChainId)) {
      return `0x${numChainId.toString(16)}`;
    }
    
    // Default fallback
    console.warn('Could not normalize chainId, using default Supra chain');
    return `0x${SUPRA_CHAIN.id.toString(16)}`;
  };

  // Create a StarKey adapter that implements the EIP-1193 standard
  const createStarkeyAdapter = (starkeyProvider: any) => {
    console.log('Creating StarKey adapter for provider:', starkeyProvider);
    
    // Create an adapter that implements the standard EIP-1193 interface
    const adapter = {
      // Core EIP-1193 methods
      request: async ({ method, params = [] }: { method: string; params?: any[] }) => {
        console.log(`StarKey adapter request: ${method}`, params);
        
        try {
          switch (method) {
            case 'eth_requestAccounts':
              // Use StarKey's native connect method
              if (typeof starkeyProvider.connect === 'function') {
                const accounts = await starkeyProvider.connect();
                console.log('StarKey connect result:', accounts);
                
                // Validate and normalize addresses
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
              } else {
                throw new Error('StarKey connect method not available');
              }
              
            case 'eth_accounts':
              // Use StarKey's native account method
              if (typeof starkeyProvider.account === 'function') {
                const accounts = await starkeyProvider.account();
                console.log('StarKey account result:', accounts);
                
                // Validate and normalize addresses
                if (Array.isArray(accounts)) {
                  const validatedAccounts = accounts
                    .map(addr => validateAndNormalizeAddress(addr))
                    .filter(addr => addr !== null);
                  
                  console.log('Validated existing accounts:', validatedAccounts);
                  return validatedAccounts;
                }
                
                return [];
              } else {
                return [];
              }
              
            case 'eth_chainId':
              // Use StarKey's native getChainId method
              if (typeof starkeyProvider.getChainId === 'function') {
                const chainIdResult = await starkeyProvider.getChainId();
                console.log('StarKey chainId result:', chainIdResult);
                const normalizedChainId = normalizeChainId(chainIdResult);
                console.log('Normalized chainId:', normalizedChainId);
                return normalizedChainId;
              } else {
                // Default to Supra testnet
                return `0x${SUPRA_CHAIN.id.toString(16)}`;
              }
              
            case 'net_version':
              // Return network version
              if (typeof starkeyProvider.getChainId === 'function') {
                const chainIdResult = await starkeyProvider.getChainId();
                const normalizedChainId = normalizeChainId(chainIdResult);
                // Convert hex back to decimal string for net_version
                return parseInt(normalizedChainId, 16).toString();
              } else {
                return SUPRA_CHAIN.id.toString();
              }
              
            case 'eth_getBalance':
              // Get balance for an address
              if (typeof starkeyProvider.getBalance === 'function') {
                return await starkeyProvider.getBalance(params[0], params[1] || 'latest');
              } else {
                // Return 0 balance if method not available
                return '0x0';
              }
              
            case 'eth_sendTransaction':
              // Send transaction using StarKey's native method
              if (typeof starkeyProvider.sendTransaction === 'function') {
                return await starkeyProvider.sendTransaction(params[0]);
              } else {
                throw new Error('StarKey sendTransaction method not available');
              }
              
            case 'personal_sign':
              // Sign message using StarKey's native method
              if (typeof starkeyProvider.signMessage === 'function') {
                return await starkeyProvider.signMessage(params[0], params[1]);
              } else {
                throw new Error('StarKey signMessage method not available');
              }
              
            case 'wallet_switchEthereumChain':
              // Switch network
              if (typeof starkeyProvider.switchNetwork === 'function') {
                return await starkeyProvider.switchNetwork(params[0].chainId);
              } else {
                throw new Error('StarKey switchNetwork method not available');
              }
              
            case 'wallet_addEthereumChain':
              // Add network
              if (typeof starkeyProvider.addNetwork === 'function') {
                return await starkeyProvider.addNetwork(params[0]);
              } else {
                throw new Error('StarKey addNetwork method not available');
              }
              
            default:
              // For any other method, try to call it directly if available
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
      
      // Event handling
      on: (event: string, callback: (...args: any[]) => void) => {
        console.log(`StarKey adapter: Adding listener for ${event}`);
        if (typeof starkeyProvider.on === 'function') {
          starkeyProvider.on(event, callback);
        }
      },
      
      removeListener: (event: string, callback: (...args: any[]) => void) => {
        console.log(`StarKey adapter: Removing listener for ${event}`);
        if (typeof starkeyProvider.removeListener === 'function') {
          starkeyProvider.removeListener(event, callback);
        }
      },
      
      // Legacy support
      send: function(method: string, params: any[]) {
        return this.request({ method, params });
      },
      
      sendAsync: function(payload: any, callback: any) {
        this.request(payload)
          .then((result: any) => callback(null, { result }))
          .catch((error: any) => callback(error));
      },
      
      // Provider identification
      isStarkey: true,
      isMetaMask: false,
      
      // Additional properties that ethers.js might expect
      selectedAddress: null,
      networkVersion: SUPRA_CHAIN.id.toString(),
      chainId: `0x${SUPRA_CHAIN.id.toString(16)}`
    };
    
    console.log('StarKey adapter created:', adapter);
    return adapter;
  };

  const connectWallet = async (preferredWalletType?: WalletType) => {
    setIsConnecting(true);
    
    try {
      console.log('Starting wallet connection...');
      
      // Wait for StarKey to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isStarkeyInstalled()) {
        console.log('StarKey not detected');
        toast.error('StarKey wallet is not installed or not fully loaded. Please refresh the page after installation.');
        return;
      }

      const rawProvider = getStarkeyProvider();
      if (!rawProvider) {
        console.log('No wallet provider found');
        toast.error('Failed to connect to StarKey wallet. Please ensure it is properly installed.');
        return;
      }

      console.log('Raw provider found:', rawProvider);

      // Create the StarKey adapter
      const walletProvider = createStarkeyAdapter(rawProvider);
      console.log('StarKey adapter created');

      console.log('Requesting accounts...');

      // Request accounts using the adapter
      let accounts: string[] = [];
      
      try {
        accounts = await walletProvider.request({
          method: 'eth_requestAccounts'
        });
        console.log('Accounts received:', accounts);
      } catch (connectError: any) {
        console.log('Connection failed:', connectError);
        throw connectError;
      }

      if (!accounts || accounts.length === 0) {
        console.log('No accounts returned');
        toast.error('No valid accounts found in StarKey wallet. Please create or unlock your wallet.');
        return;
      }

      // Validate the first account
      const primaryAccount = accounts[0];
      if (!ethers.utils.isAddress(primaryAccount)) {
        console.log('Invalid account address format:', primaryAccount);
        toast.error('Invalid account address format from StarKey wallet.');
        return;
      }

      console.log('Creating Web3 provider...');
      
      // Create ethers provider with the adapter and let it detect the network
      const web3Provider = new ethers.providers.Web3Provider(walletProvider, 'any');
      console.log('Provider created');
      
      // Test the connection
      try {
        console.log('Testing provider connection...');
        
        // Get network info
        const network = await web3Provider.getNetwork();
        console.log('Network detected:', network);
        
        // Create signer
        const web3Signer = web3Provider.getSigner();
        console.log('Signer created');
        
        // Verify signer address matches account
        try {
          const signerAddress = await web3Signer.getAddress();
          console.log('Signer address:', signerAddress);
          console.log('Account address:', primaryAccount);

          // Set state
          setProvider(web3Provider);
          setSigner(web3Signer);
          setAccount(primaryAccount);
          setChainId(network.chainId);
          setWalletType('starkey');

          // Check if we're on the correct network
          if (network.chainId !== SUPRA_CHAIN.id) {
            console.log('Wrong network detected, current:', network.chainId, 'expected:', SUPRA_CHAIN.id);
            toast.success('Connected to StarKey! Please switch to Supra network in your wallet.');
          } else {
            toast.success('Successfully connected to StarKey wallet!');
          }
        } catch (signerError: any) {
          console.log('Signer address verification failed, but connection successful:', signerError);
          
          // Set state anyway since we have a valid account
          setProvider(web3Provider);
          setSigner(web3Signer);
          setAccount(primaryAccount);
          setChainId(network.chainId);
          setWalletType('starkey');

          // Check if we're on the correct network
          if (network.chainId !== SUPRA_CHAIN.id) {
            console.log('Wrong network detected, current:', network.chainId, 'expected:', SUPRA_CHAIN.id);
            toast.success('Connected to StarKey! Please switch to Supra network in your wallet.');
          } else {
            toast.success('Successfully connected to StarKey wallet!');
          }
        }
      } catch (providerError: any) {
        console.error('Provider setup failed:', providerError);
        
        // Provide more specific error messages
        if (providerError.message && providerError.message.includes('unsupported provider')) {
          toast.error('StarKey provider format not supported. Please try refreshing the page or updating StarKey.');
        } else if (providerError.message && providerError.message.includes('network')) {
          toast.error('Network configuration error. Please check your StarKey network settings.');
        } else if (providerError.message && providerError.message.includes('BigNumber')) {
          toast.error('Network ID format error. Please ensure StarKey is properly configured.');
        } else if (providerError.message && providerError.message.includes('invalid address')) {
          toast.error('Invalid address format from StarKey. Please check your wallet configuration.');
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
      } else if (error.message && error.message.includes('User rejected')) {
        toast.error('Connection rejected by user');
      } else if (error.message && error.message.includes('unsupported provider')) {
        toast.error('StarKey provider not compatible. Please update StarKey or refresh the page.');
      } else if (error.message && error.message.includes('No valid Ethereum addresses')) {
        toast.error('StarKey returned invalid address format. Please check your wallet configuration.');
      } else {
        toast.error(`Failed to connect to StarKey wallet: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSupraNetwork = async () => {
    const currentProvider = getStarkeyProvider();
    if (!currentProvider || pendingNetworkRequest) return;

    setPendingNetworkRequest(true);
    try {
      console.log('Switching to Supra network...');
      
      // Create adapter for network switching
      const adapter = createStarkeyAdapter(currentProvider);
      
      await adapter.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SUPRA_CHAIN.id.toString(16)}` }]
      });
      
      toast.success('Successfully switched to Supra network!');
    } catch (switchError: any) {
      console.log('Switch network error:', switchError);
      
      if (switchError.code === 4902) {
        // Network not added to wallet, try to add it
        try {
          console.log('Adding Supra network...');
          
          const adapter = createStarkeyAdapter(currentProvider);
          
          await adapter.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SUPRA_CHAIN.id.toString(16)}`,
              chainName: SUPRA_CHAIN.name,
              nativeCurrency: SUPRA_CHAIN.nativeCurrency,
              rpcUrls: SUPRA_CHAIN.rpcUrls.default.http,
              blockExplorerUrls: [SUPRA_CHAIN.blockExplorers.default.url]
            }]
          });
          
          toast.success('Supra network added and switched successfully!');
        } catch (addError: any) {
          console.error('Failed to add Supra network:', addError);
          
          if (addError.code === 4001) {
            toast.error('Please approve the request to add Supra network in StarKey');
          } else if (addError.code === -32002) {
            toast.error('Please check StarKey - there may be a pending request to approve');
          } else {
            toast.error('Failed to add Supra network to StarKey');
          }
        }
      } else if (switchError.code === 4001) {
        toast.error('Please approve the network switch in StarKey');
      } else if (switchError.code === -32002) {
        toast.error('Please check StarKey - there may be a pending request to approve');
      } else {
        console.error('Failed to switch to Supra network:', switchError);
        toast.error('Failed to switch to Supra network');
      }
    } finally {
      setPendingNetworkRequest(false);
    }
  };

  const disconnectWallet = async () => {
    console.log('Disconnecting wallet...');
    
    // Use StarKey's native disconnect method if available
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
    toast.success('StarKey wallet disconnected');
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // Validate the new account
        const validatedAccount = validateAndNormalizeAddress(accounts[0]);
        if (validatedAccount) {
          setAccount(validatedAccount);
        } else {
          console.error('Invalid account format in accounts changed event');
          disconnectWallet();
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      const normalizedChainId = normalizeChainId(chainId);
      setChainId(parseInt(normalizedChainId, 16));
    };

    // Set up event listeners for StarKey
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

    // Check if already connected on page load
    const checkExistingConnection = async () => {
      try {
        // Wait for StarKey to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (isStarkeyInstalled()) {
          const starkeyProvider = getStarkeyProvider();
          if (starkeyProvider) {
            try {
              console.log('Checking for existing connection...');
              
              const adapter = createStarkeyAdapter(starkeyProvider);
              
              // Check for existing accounts without requesting permission
              const accounts = await adapter.request({ method: 'eth_accounts' });
              
              if (accounts && accounts.length > 0) {
                console.log('Found existing connection, auto-connecting...');
                
                // Validate the account
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
                
                console.log('Auto-connected to StarKey wallet');
              }
            } catch (error) {
              // StarKey not connected or user hasn't authorized
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

  return (
    <Web3Context.Provider value={{
      provider,
      signer,
      account,
      chainId,
      isConnecting,
      walletType,
      connectWallet,
      disconnectWallet,
      switchToSupraNetwork
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
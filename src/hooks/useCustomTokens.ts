import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Token } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const CUSTOM_TOKENS_STORAGE_KEY = 'toonswap_custom_tokens';

export interface CustomToken extends Token {
  isCustom: true;
  addedAt: number;
  verified: boolean;
}

export const useCustomTokens = () => {
  const { provider, chainId } = useWeb3();
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load custom tokens from localStorage on mount
  useEffect(() => {
    loadCustomTokens();
  }, [chainId]);

  // Load custom tokens from localStorage
  const loadCustomTokens = () => {
    try {
      const stored = localStorage.getItem(CUSTOM_TOKENS_STORAGE_KEY);
      if (stored) {
        const allCustomTokens: CustomToken[] = JSON.parse(stored);
        // Filter tokens for current chain
        const chainTokens = allCustomTokens.filter(token => token.chainId === chainId);
        setCustomTokens(chainTokens);
        console.log(`Loaded ${chainTokens.length} custom tokens for chain ${chainId}`);
      }
    } catch (error) {
      console.error('Error loading custom tokens:', error);
      setCustomTokens([]);
    }
  };

  // Save custom tokens to localStorage
  const saveCustomTokens = (tokens: CustomToken[]) => {
    try {
      // Get all existing tokens from storage
      const stored = localStorage.getItem(CUSTOM_TOKENS_STORAGE_KEY);
      let allTokens: CustomToken[] = stored ? JSON.parse(stored) : [];
      
      // Remove old tokens for current chain
      allTokens = allTokens.filter(token => token.chainId !== chainId);
      
      // Add new tokens for current chain
      allTokens = [...allTokens, ...tokens];
      
      localStorage.setItem(CUSTOM_TOKENS_STORAGE_KEY, JSON.stringify(allTokens));
      setCustomTokens(tokens);
      console.log(`Saved ${tokens.length} custom tokens for chain ${chainId}`);
    } catch (error) {
      console.error('Error saving custom tokens:', error);
      toast.error('Failed to save custom token');
    }
  };

  // Validate token contract and get token info
  const validateTokenContract = async (address: string): Promise<{
    isValid: boolean;
    tokenInfo?: {
      name: string;
      symbol: string;
      decimals: number;
    };
    error?: string;
  }> => {
    if (!provider || !chainId) {
      return { isValid: false, error: 'Wallet not connected' };
    }

    try {
      // Validate address format
      if (!ethers.utils.isAddress(address)) {
        return { isValid: false, error: 'Invalid contract address format' };
      }

      // Check if contract exists
      const code = await provider.getCode(address);
      if (code === '0x') {
        return { isValid: false, error: 'No contract found at this address' };
      }

      // Create contract instance with ERC20 ABI
      const tokenContract = new ethers.Contract(
        address,
        [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function totalSupply() view returns (uint256)',
          'function balanceOf(address) view returns (uint256)'
        ],
        provider
      );

      // Get token information
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name().catch(() => 'Unknown Token'),
        tokenContract.symbol().catch(() => 'UNKNOWN'),
        tokenContract.decimals().catch(() => 18),
        tokenContract.totalSupply().catch(() => ethers.BigNumber.from(0))
      ]);

      // Validate token data
      if (!symbol || symbol.length === 0) {
        return { isValid: false, error: 'Invalid token: no symbol found' };
      }

      if (decimals < 0 || decimals > 18) {
        return { isValid: false, error: 'Invalid token: invalid decimals' };
      }

      if (totalSupply.eq(0)) {
        return { isValid: false, error: 'Warning: Token has zero total supply' };
      }

      return {
        isValid: true,
        tokenInfo: {
          name: name || 'Unknown Token',
          symbol: symbol.toUpperCase(),
          decimals: Number(decimals)
        }
      };

    } catch (error: any) {
      console.error('Token validation error:', error);
      
      if (error.code === 'CALL_EXCEPTION') {
        return { isValid: false, error: 'Contract is not a valid ERC20 token' };
      } else if (error.code === 'NETWORK_ERROR') {
        return { isValid: false, error: 'Network error. Please try again.' };
      } else {
        return { isValid: false, error: `Validation failed: ${error.message || 'Unknown error'}` };
      }
    }
  };

  // Add custom token
  const addCustomToken = async (address: string): Promise<boolean> => {
    if (!chainId) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Adding custom token: ${address} on chain ${chainId}`);

      // Check if token already exists
      const existingToken = customTokens.find(
        token => token.address.toLowerCase() === address.toLowerCase()
      );

      if (existingToken) {
        toast.error('Token already added to your list');
        return false;
      }

      // Validate token contract
      const validation = await validateTokenContract(address);
      
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid token contract');
        return false;
      }

      if (!validation.tokenInfo) {
        toast.error('Failed to get token information');
        return false;
      }

      // Create custom token object
      const customToken: CustomToken = {
        name: validation.tokenInfo.name,
        symbol: validation.tokenInfo.symbol,
        address: ethers.utils.getAddress(address), // Normalize address
        chainId: chainId,
        decimals: validation.tokenInfo.decimals,
        logoURI: `https://via.placeholder.com/32x32/6C5CE7/FFFFFF?text=${validation.tokenInfo.symbol[0]}`,
        isCustom: true,
        addedAt: Date.now(),
        verified: false
      };

      // Add to list and save
      const updatedTokens = [...customTokens, customToken];
      saveCustomTokens(updatedTokens);

      toast.success(`${customToken.symbol} added successfully!`);
      console.log('Custom token added:', customToken);
      return true;

    } catch (error: any) {
      console.error('Error adding custom token:', error);
      toast.error(`Failed to add token: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove custom token
  const removeCustomToken = (address: string) => {
    try {
      const updatedTokens = customTokens.filter(
        token => token.address.toLowerCase() !== address.toLowerCase()
      );
      saveCustomTokens(updatedTokens);
      toast.success('Token removed from your list');
      console.log(`Removed custom token: ${address}`);
    } catch (error) {
      console.error('Error removing custom token:', error);
      toast.error('Failed to remove token');
    }
  };

  // Clear all custom tokens for current chain
  const clearCustomTokens = () => {
    try {
      saveCustomTokens([]);
      toast.success('All custom tokens cleared');
      console.log(`Cleared all custom tokens for chain ${chainId}`);
    } catch (error) {
      console.error('Error clearing custom tokens:', error);
      toast.error('Failed to clear tokens');
    }
  };

  // Get all tokens (default + custom)
  const getAllTokens = (defaultTokens: Token[]): Token[] => {
    return [...defaultTokens, ...customTokens];
  };

  return {
    customTokens,
    isLoading,
    addCustomToken,
    removeCustomToken,
    clearCustomTokens,
    getAllTokens,
    validateTokenContract
  };
};
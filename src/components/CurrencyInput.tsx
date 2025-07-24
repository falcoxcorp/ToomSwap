import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TokenSelector from './TokenSelector';
import { Token, formatTokenAmount } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import { DexService } from '../services/dexService';
import { priceService } from '../services/priceService';

interface CurrencyInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  selectedToken: Token;
  onTokenChange: (token: Token) => void;
  otherToken?: Token;
  balance?: string;
  readOnly?: boolean;
  showMaxButton?: boolean;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onValueChange,
  selectedToken,
  onTokenChange,
  otherToken,
  balance,
  readOnly = false,
  showMaxButton = true,
  className = ""
}) => {
  const { account, getTokenBalance } = useWeb3();
  const [tokenBalance, setTokenBalance] = useState<string>('0.0000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const { provider, signer, chainId } = useWeb3();

  // Fetch token balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !selectedToken) {
        setTokenBalance('0.0000');
        return;
      }

      setIsLoadingBalance(true);
      try {
        // Try to get balance using DexService for more accurate results
        if (provider && signer && chainId) {
          const dexService = new DexService(provider, signer, chainId);
          const balance = await dexService.getTokenBalance(selectedToken, account);
          setTokenBalance(balance);
        } else {
          // Fallback to Web3Context method
          const balance = await getTokenBalance(selectedToken.address);
          setTokenBalance(balance);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance('0.0000');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [account, selectedToken, getTokenBalance, provider, signer, chainId]);

  // Fetch USD value when value or token changes
  useEffect(() => {
    const fetchUSDValue = async () => {
      if (!value || parseFloat(value) <= 0) {
        setUsdValue(null);
        return;
      }

      setIsLoadingPrice(true);
      try {
        const usdVal = await priceService.getUSDValue(selectedToken, value);
        setUsdValue(usdVal);
      } catch (error) {
        console.error('Error fetching USD value:', error);
        setUsdValue(null);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    const timeoutId = setTimeout(fetchUSDValue, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [value, selectedToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string
    if (inputValue === '') {
      onValueChange('');
      return;
    }
    
    // Validate numeric input with decimal support
    if (/^\d*\.?\d*$/.test(inputValue)) {
      // Prevent multiple decimal points
      const decimalCount = (inputValue.match(/\./g) || []).length;
      if (decimalCount <= 1) {
        // Limit decimal places to token decimals
        const parts = inputValue.split('.');
        if (parts[1] && parts[1].length > selectedToken.decimals) {
          return; // Don't update if too many decimal places
        }
        onValueChange(inputValue);
      }
    }
  };

  const handleMaxClick = () => {
    const availableBalance = balance || tokenBalance;
    if (availableBalance && parseFloat(availableBalance) > 0) {
      // For native tokens, leave a small amount for gas
      if (selectedToken.address === '0x0000000000000000000000000000000000000000') {
        const balanceNum = parseFloat(availableBalance);
        const maxAmount = Math.max(0, balanceNum - 0.01); // Leave 0.01 for gas
        onValueChange(maxAmount.toString());
      } else {
        onValueChange(availableBalance);
      }
    }
  };

  const displayBalance = balance || tokenBalance;
  const formattedBalance = formatTokenAmount(displayBalance, selectedToken.decimals);

  const hasInsufficientBalance = value && parseFloat(value) > parseFloat(displayBalance) && !readOnly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-3 sm:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 
        backdrop-blur-sm border border-white/20
        hover:border-white/30 transition-all duration-200 relative
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {/* Decorative gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Header with label and balance */}
      <div className="flex justify-between items-center mb-3 relative">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {account && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-400">
              Balance: 
              <span className={`font-semibold text-white ml-1 ${isLoadingBalance ? 'animate-pulse' : ''}`}>
                {isLoadingBalance ? '...' : formattedBalance}
              </span>
            </span>
            {!readOnly && showMaxButton && parseFloat(displayBalance) > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMaxClick}
                className="
                  px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-purple-300 hover:text-white
                  bg-gradient-to-r from-purple-500/20 to-purple-600/20 
                  hover:from-purple-500/30 hover:to-purple-600/30 
                  border border-purple-500/30 hover:border-purple-400/50
                  rounded-lg transition-all duration-200
                "
              >
                MAX
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Input and token selector */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="0.0"
          readOnly={readOnly}
          className={`
            flex-1 bg-transparent text-xl sm:text-2xl lg:text-3xl font-bold text-white
            placeholder-gray-500 focus:outline-none min-w-0
            transition-all duration-200
            ${readOnly ? 'cursor-default' : 'cursor-text'}
            ${hasInsufficientBalance ? 'text-red-400' : 'text-white'}
          `}
          autoComplete="off"
          spellCheck="false"
        />
        
        <div className="flex-shrink-0">
          <TokenSelector
            selectedToken={selectedToken}
            onSelectToken={onTokenChange}
            otherToken={otherToken}
          />
        </div>
      </div>

      {/* USD value display */}
      {usdValue && usdValue > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/10 relative"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">USD Value</span>
            <span className="text-gray-300 font-semibold flex items-center gap-1">
              {isLoadingPrice ? (
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>≈ ${usdValue < 0.01 ? '< $0.01' : usdValue.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</>
              )}
            </span>
          </div>
        </motion.div>
      )}

      {/* Input validation feedback */}
      {hasInsufficientBalance && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-xs text-red-400 flex items-center gap-1"
        >
          <span>⚠️</span>
          <span>Insufficient {selectedToken.symbol} balance</span>
        </motion.div>
      )}

      {/* Loading state for balance */}
      {isLoadingBalance && account && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"
        />
      )}
    </motion.div>
  );
};

export default CurrencyInput;
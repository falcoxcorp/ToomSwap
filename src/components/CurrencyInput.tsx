import React from 'react';
import { motion } from 'framer-motion';
import TokenSelector from './TokenSelector';
import { Token } from '../constants/tokens';

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
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onValueChange,
  selectedToken,
  onTokenChange,
  otherToken,
  balance = "0.0000",
  readOnly = false,
  showMaxButton = true
}) => {
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
        // Limit decimal places to token decimals (usually 6-18)
        const parts = inputValue.split('.');
        if (parts[1] && parts[1].length > selectedToken.decimals) {
          return; // Don't update if too many decimal places
        }
        onValueChange(inputValue);
      }
    }
  };

  const handleMaxClick = () => {
    if (balance && parseFloat(balance) > 0) {
      onValueChange(balance);
    }
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num === 0) return '0.0000';
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getUSDValue = () => {
    if (!value || parseFloat(value) <= 0) return null;
    
    // Mock USD prices (in real app, fetch from price API)
    const mockPrices: { [key: string]: number } = {
      'SUPRA': 0.85,
      'WSUPRA': 0.85,
      'USDT': 1.00,
      'TOON': 0.12
    };
    
    const price = mockPrices[selectedToken.symbol] || 1.0;
    const usdValue = parseFloat(value) * price;
    
    return usdValue;
  };

  const usdValue = getUSDValue();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 
        backdrop-blur-sm border border-white/20
        hover:border-white/30 transition-all duration-200 relative
        shadow-lg hover:shadow-xl
      "
    >
      {/* Decorative gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Header with label and balance */}
      <div className="flex justify-between items-center mb-3 relative">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {balance && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-400">
              Balance: <span className="font-semibold text-white">{formatBalance(balance)}</span>
            </span>
            {!readOnly && showMaxButton && parseFloat(balance) > 0 && (
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
          className="
            flex-1 bg-transparent text-2xl sm:text-3xl font-bold text-white
            placeholder-gray-500 focus:outline-none min-w-0
            transition-all duration-200
          "
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
            <span className="text-gray-300 font-semibold">
              ≈ ${usdValue < 0.01 ? '< $0.01' : usdValue.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
        </motion.div>
      )}

      {/* Input validation feedback */}
      {value && parseFloat(value) > parseFloat(balance) && !readOnly && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-xs text-red-400 flex items-center gap-1"
        >
          <span>⚠️</span>
          <span>Insufficient {selectedToken.symbol} balance</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CurrencyInput;
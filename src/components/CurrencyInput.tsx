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
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onValueChange,
  selectedToken,
  onTokenChange,
  otherToken,
  balance,
  readOnly = false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onValueChange(inputValue);
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      onValueChange(balance);
    }
  };

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
      
      <div className="flex justify-between items-center mb-3 relative">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {balance && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-400">
              Balance: <span className="font-semibold text-white">{parseFloat(balance).toFixed(4)}</span>
            </span>
            {!readOnly && (
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
        />
        
        <div className="flex-shrink-0">
          <TokenSelector
            selectedToken={selectedToken}
            onSelectToken={onTokenChange}
            otherToken={otherToken}
          />
        </div>
      </div>

      {value && parseFloat(value) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/10 relative"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">USD Value</span>
            <span className="text-gray-300 font-semibold">
              ≈ ${(parseFloat(value) * 1.0).toFixed(2)}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CurrencyInput;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings, Info } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import SettingsModal from './SettingsModal';
import { Token, NATIVE_TOKEN, USDT_TOKEN } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const SwapCard: React.FC = () => {
  const { account, signer } = useWeb3();
  const [fromToken, setFromToken] = useState<Token>(NATIVE_TOKEN);
  const [toToken, setToToken] = useState<Token>(USDT_TOKEN);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [slippage, setSlippage] = useState(0.5);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!account || !signer) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      // Mock swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Swap completed successfully!');
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock price calculation
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const mockRate = 0.98; // Mock exchange rate
      const calculatedAmount = (parseFloat(fromAmount) * mockRate).toString();
      setToAmount(calculatedAmount);
      setPriceImpact(2.0); // Mock price impact
    } else {
      setToAmount('');
      setPriceImpact(null);
    }
  }, [fromAmount, fromToken, toToken]);

  const isSwapDisabled = !account || !fromAmount || parseFloat(fromAmount) <= 0 || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        w-full max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 rounded-3xl
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-xl border border-white/10 shadow-2xl
      "
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white">Exchange</h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className="
              p-2 rounded-xl bg-white/5 hover:bg-white/10
              border border-white/10 transition-colors
            "
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="
              p-2 rounded-xl bg-white/5 hover:bg-white/10
              border border-white/10 transition-colors
            "
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        <CurrencyInput
          label="From"
          value={fromAmount}
          onValueChange={setFromAmount}
          selectedToken={fromToken}
          onTokenChange={setFromToken}
          otherToken={toToken}
          balance="0.0000"
        />

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapTokens}
            className="
              p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10
              border border-white/10 transition-all duration-200
            "
          >
            <ArrowUpDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </motion.button>
        </div>

        <CurrencyInput
          label="To"
          value={toAmount}
          onValueChange={setToAmount}
          selectedToken={toToken}
          onTokenChange={setToToken}
          otherToken={fromToken}
          balance="0.0000"
          readOnly
        />
      </div>

      {priceImpact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-yellow-400">
              Price Impact: {priceImpact.toFixed(2)}%
            </span>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSwap}
        disabled={isSwapDisabled}
        className="
          w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg
          bg-gradient-to-r from-purple-600 to-blue-600
          hover:from-purple-700 hover:to-blue-700
          disabled:from-gray-600 disabled:to-gray-700
          disabled:cursor-not-allowed text-white
          transition-all duration-200
        "
      >
        {!account 
          ? 'Connect Wallet to Swap'
          : isLoading 
          ? 'Swapping...'
          : 'Swap'
        }
      </motion.button>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </motion.div>
  );
};

export default SwapCard;
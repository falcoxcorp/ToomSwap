import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Info } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { Token, NATIVE_TOKEN, USDT_TOKEN } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

interface LiquidityCardProps {
  onBack: () => void;
}

const LiquidityCard: React.FC<LiquidityCardProps> = ({ onBack }) => {
  const { account, signer } = useWeb3();
  const [tokenA, setTokenA] = useState<Token>(NATIVE_TOKEN);
  const [tokenB, setTokenB] = useState<Token>(USDT_TOKEN);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLiquidity = async () => {
    if (!account || !signer) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      toast.error('Please enter valid amounts for both tokens');
      return;
    }

    setIsLoading(true);
    try {
      // Mock add liquidity transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Liquidity added successfully!');
      setAmountA('');
      setAmountB('');
    } catch (error) {
      console.error('Add liquidity failed:', error);
      toast.error('Failed to add liquidity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAddDisabled = !account || !amountA || !amountB || 
    parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0 || isLoading;

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
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="
            p-2 rounded-xl bg-white/5 hover:bg-white/10
            border border-white/10 transition-colors
          "
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </motion.button>
        <h2 className="text-lg sm:text-xl font-bold text-white">Add Liquidity</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="
            p-2 rounded-xl bg-white/5 hover:bg-white/10
            border border-white/10 transition-colors ml-auto
          "
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </motion.button>
      </div>

      <div className="space-y-3">
        <CurrencyInput
          label="Input"
          value={amountA}
          onValueChange={setAmountA}
          selectedToken={tokenA}
          onTokenChange={setTokenA}
          otherToken={tokenB}
          balance="0.0000"
        />

        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="
              p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10
            "
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </motion.div>
        </div>

        <CurrencyInput
          label="Input"
          value={amountB}
          onValueChange={setAmountB}
          selectedToken={tokenB}
          onTokenChange={setTokenB}
          otherToken={tokenA}
          balance="0.0000"
        />
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-xs sm:text-sm text-gray-400 mb-2">Pool Information</div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Your share</span>
            <span className="text-white">0%</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Pool ratio</span>
            <span className="text-white">1:1</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddLiquidity}
        disabled={isAddDisabled}
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
          ? 'Connect Wallet'
          : isLoading 
          ? 'Adding Liquidity...'
          : 'Add Liquidity'
        }
      </motion.button>
    </motion.div>
  );
};

export default LiquidityCard;
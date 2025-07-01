import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, AlertTriangle, Info } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

interface LiquidityPosition {
  id: string;
  tokenA: string;
  tokenB: string;
  tokenAAmount: string;
  tokenBAmount: string;
  lpTokens: string;
  share: number;
  value: number;
  apy: number;
  version: 'V2' | 'V3';
}

interface RemoveLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: LiquidityPosition;
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  isOpen,
  onClose,
  position
}) => {
  const { account, signer } = useWeb3();
  const [removePercentage, setRemovePercentage] = useState(25);
  const [isLoading, setIsLoading] = useState(false);

  const presetPercentages = [25, 50, 75, 100];

  // Calculate removal amounts
  const calculateRemovalAmounts = () => {
    const tokenAAmount = (parseFloat(position.tokenAAmount.replace(/,/g, '')) * removePercentage / 100);
    const tokenBAmount = (parseFloat(position.tokenBAmount.replace(/,/g, '')) * removePercentage / 100);
    const lpTokensAmount = (parseFloat(position.lpTokens) * removePercentage / 100);
    
    return {
      tokenA: tokenAAmount.toFixed(6),
      tokenB: tokenBAmount.toFixed(6),
      lpTokens: lpTokensAmount.toFixed(6),
      value: (position.value * removePercentage / 100).toFixed(2)
    };
  };

  const handleRemoveLiquidity = async () => {
    if (!account || !signer) {
      toast.error('Please connect your wallet');
      return;
    }

    if (removePercentage <= 0) {
      toast.error('Please select an amount to remove');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const amounts = calculateRemovalAmounts();
      toast.success(
        `Successfully removed ${removePercentage}% liquidity! Received ${amounts.tokenA} ${position.tokenA} and ${amounts.tokenB} ${position.tokenB}`
      );
      
      onClose();
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      toast.error('Failed to remove liquidity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const amounts = calculateRemovalAmounts();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="
              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-full max-w-sm sm:max-w-md p-4 sm:p-6 rounded-3xl z-50
              bg-gradient-to-br from-gray-900/95 to-gray-800/95
              backdrop-blur-xl border border-white/10 shadow-2xl
              max-h-[90vh] overflow-y-auto mx-4
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Minus className="w-5 h-5 text-red-400" />
                Remove Liquidity
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="
                  p-2 rounded-xl bg-white/5 hover:bg-white/10
                  border border-white/10 transition-colors
                "
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* Position Info */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-base sm:text-lg font-bold text-white">
                  {position.tokenA}/{position.tokenB}
                </div>
                <span className={`
                  px-2 py-1 rounded-lg text-xs font-medium
                  ${position.version === 'V3' 
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }
                `}>
                  {position.version}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Total Value: <span className="text-white font-medium">${position.value.toLocaleString()}</span>
              </div>
            </div>

            {/* Percentage Selection */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-white text-sm sm:text-base">Amount to Remove</span>
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </div>
              
              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {presetPercentages.map((percentage) => (
                  <motion.button
                    key={percentage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRemovePercentage(percentage)}
                    className={`
                      py-2 px-3 rounded-xl text-sm font-medium transition-all
                      ${removePercentage === percentage
                        ? 'bg-red-600 text-white border border-red-500'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    {percentage}%
                  </motion.button>
                ))}
              </div>

              {/* Custom Percentage Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Custom Amount</span>
                  <span className="text-white font-medium">{removePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={removePercentage}
                  onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
                  className="
                    w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                    slider-thumb
                  "
                />
              </div>
            </div>

            {/* Removal Preview */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm font-medium text-red-300 mb-3">You will receive:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{position.tokenA}</span>
                  <span className="text-white font-medium">{amounts.tokenA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{position.tokenB}</span>
                  <span className="text-white font-medium">{amounts.tokenB}</span>
                </div>
                <div className="border-t border-red-500/20 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Value</span>
                    <span className="text-white font-bold">${amounts.value}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            {removePercentage === 100 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-400">
                  <div className="font-medium mb-1">Complete Removal</div>
                  <div>
                    You are removing 100% of your liquidity. This position will be completely closed.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="
                  flex-1 py-3 rounded-xl font-semibold text-base
                  bg-white/5 hover:bg-white/10 border border-white/10
                  text-gray-300 hover:text-white transition-all duration-200
                "
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRemoveLiquidity}
                disabled={isLoading || removePercentage <= 0}
                className="
                  flex-1 py-3 rounded-xl font-semibold text-base
                  bg-gradient-to-r from-red-600 to-red-700
                  hover:from-red-700 hover:to-red-800
                  disabled:from-gray-600 disabled:to-gray-700
                  disabled:cursor-not-allowed text-white
                  transition-all duration-200 relative overflow-hidden
                "
              >
                {isLoading && (
                  <motion.div
                    animate={{ x: [-100, 400] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
                <span className="relative">
                  {isLoading ? 'Removing...' : `Remove ${removePercentage}%`}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RemoveLiquidityModal;
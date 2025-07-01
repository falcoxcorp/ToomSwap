import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Info, AlertTriangle, Droplets } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { Token, NATIVE_TOKEN, USDT_TOKEN } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

interface LiquidityCardProps {
  onBack: () => void;
}

const LiquidityCard: React.FC<LiquidityCardProps> = ({ onBack }) => {
  const { account, signer, chainId } = useWeb3();
  const [tokenA, setTokenA] = useState<Token>(NATIVE_TOKEN);
  const [tokenB, setTokenB] = useState<Token>(USDT_TOKEN);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [poolExists, setPoolExists] = useState(true);
  const [poolRatio, setPoolRatio] = useState<string>('1:1');
  const [yourShare, setYourShare] = useState<number>(0);
  const [lpTokensToReceive, setLpTokensToReceive] = useState<string>('');
  const [priceImpact, setPriceImpact] = useState<number>(0);

  // Validate liquidity addition
  const validateLiquidity = () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      toast.error('Please enter valid amounts for both tokens');
      return false;
    }

    if (tokenA.address === tokenB.address) {
      toast.error('Cannot create pool with the same token');
      return false;
    }

    if (chainId !== 8) {
      toast.error('Please switch to Supra network');
      return false;
    }

    return true;
  };

  // Calculate liquidity details
  const calculateLiquidityDetails = () => {
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      setLpTokensToReceive('');
      setPriceImpact(0);
      setYourShare(0);
      return;
    }

    const amtA = parseFloat(amountA);
    const amtB = parseFloat(amountB);

    // Mock pool calculations
    const totalLiquidity = 1000000; // Mock total pool liquidity
    const lpTokens = Math.sqrt(amtA * amtB); // Geometric mean for LP tokens
    const share = (lpTokens / (totalLiquidity + lpTokens)) * 100;
    
    // Calculate price impact for large additions
    let impact = 0;
    if (amtA > 10000 || amtB > 10000) impact = 2.5;
    else if (amtA > 5000 || amtB > 5000) impact = 1.2;
    else if (amtA > 1000 || amtB > 1000) impact = 0.5;

    setLpTokensToReceive(lpTokens.toFixed(6));
    setPriceImpact(impact);
    setYourShare(share);

    // Update pool ratio
    const ratio = (amtA / amtB).toFixed(4);
    setPoolRatio(`${ratio}:1`);
  };

  // Handle amount changes with auto-calculation
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    
    if (poolExists && value && parseFloat(value) > 0) {
      // Auto-calculate amount B based on pool ratio
      const calculatedB = (parseFloat(value) * 1.18).toFixed(6); // Mock ratio
      setAmountB(calculatedB);
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    
    if (poolExists && value && parseFloat(value) > 0) {
      // Auto-calculate amount A based on pool ratio
      const calculatedA = (parseFloat(value) * 0.85).toFixed(6); // Mock ratio
      setAmountA(calculatedA);
    }
  };

  // Add liquidity
  const handleAddLiquidity = async () => {
    if (!validateLiquidity()) return;

    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`Successfully added liquidity! Received ${lpTokensToReceive} LP tokens`);
      
      // Reset form
      setAmountA('');
      setAmountB('');
      setLpTokensToReceive('');
      setPriceImpact(0);
      setYourShare(0);
      
    } catch (error) {
      console.error('Add liquidity failed:', error);
      toast.error('Failed to add liquidity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update calculations when amounts change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateLiquidityDetails();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [amountA, amountB, tokenA, tokenB]);

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
      {/* Header */}
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
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          Add Liquidity
        </h2>
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

      {/* Pool Status */}
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 text-sm text-blue-300">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          {poolExists ? 'Pool exists' : 'New pool will be created'}
        </div>
      </div>

      {/* Liquidity Inputs */}
      <div className="space-y-3">
        <CurrencyInput
          label="Input"
          value={amountA}
          onValueChange={handleAmountAChange}
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
          onValueChange={handleAmountBChange}
          selectedToken={tokenB}
          onTokenChange={setTokenB}
          otherToken={tokenA}
          balance="0.0000"
        />
      </div>

      {/* Liquidity Details */}
      {amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3"
        >
          {/* Price Impact Warning */}
          {priceImpact > 1 && (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-sm text-yellow-400">
                Price Impact: {priceImpact.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Pool Information */}
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs sm:text-sm text-gray-400 mb-3 font-medium">Pool Information</div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pool Ratio</span>
                <span className="text-white font-medium">{poolRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Share</span>
                <span className="text-white font-medium">{yourShare.toFixed(4)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">LP Tokens to Receive</span>
                <span className="text-white font-medium">{lpTokensToReceive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{tokenA.symbol} per {tokenB.symbol}</span>
                <span className="text-white font-medium">
                  {amountA && amountB ? (parseFloat(amountA) / parseFloat(amountB)).toFixed(6) : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{tokenB.symbol} per {tokenA.symbol}</span>
                <span className="text-white font-medium">
                  {amountA && amountB ? (parseFloat(amountB) / parseFloat(amountA)).toFixed(6) : '0'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Liquidity Button */}
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
          {!account 
            ? 'Connect Wallet'
            : isLoading 
            ? 'Adding Liquidity...'
            : 'Add Liquidity'
          }
        </span>
      </motion.button>
    </motion.div>
  );
};

export default LiquidityCard;
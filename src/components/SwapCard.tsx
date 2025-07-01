import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings, Info, AlertTriangle, TrendingUp } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import SettingsModal from './SettingsModal';
import { Token, NATIVE_TOKEN, USDT_TOKEN } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const SwapCard: React.FC = () => {
  const { account, signer, chainId } = useWeb3();
  const [fromToken, setFromToken] = useState<Token>(NATIVE_TOKEN);
  const [toToken, setToToken] = useState<Token>(USDT_TOKEN);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [minimumReceived, setMinimumReceived] = useState<string>('');
  const [liquidityProviderFee, setLiquidityProviderFee] = useState<string>('');
  const [routePath, setRoutePath] = useState<string[]>([]);

  // Validate swap parameters
  const validateSwap = () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (fromToken.address === toToken.address) {
      toast.error('Cannot swap the same token');
      return false;
    }

    if (chainId !== 8) {
      toast.error('Please switch to Supra network');
      return false;
    }

    return true;
  };

  // Calculate swap details
  const calculateSwapDetails = (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setToAmount('');
      setPriceImpact(null);
      setExchangeRate(null);
      setMinimumReceived('');
      setLiquidityProviderFee('');
      setRoutePath([]);
      return;
    }

    const amount = parseFloat(inputAmount);
    
    // Mock exchange rate calculation (in real app, this would come from DEX)
    let rate = 1.0;
    if (fromToken.symbol === 'SUPRA' && toToken.symbol === 'USDT') {
      rate = 0.85; // 1 SUPRA = 0.85 USDT
    } else if (fromToken.symbol === 'USDT' && toToken.symbol === 'SUPRA') {
      rate = 1.18; // 1 USDT = 1.18 SUPRA
    } else if (fromToken.symbol === 'WSUPRA') {
      rate = fromToken.symbol === toToken.symbol ? 1.0 : 0.85;
    }

    // Calculate price impact based on trade size
    let impact = 0;
    if (amount > 1000) impact = 3.5;
    else if (amount > 500) impact = 2.1;
    else if (amount > 100) impact = 1.2;
    else if (amount > 10) impact = 0.5;
    else impact = 0.1;

    // Apply price impact to rate
    const adjustedRate = rate * (1 - impact / 100);
    const outputAmount = amount * adjustedRate;

    // Calculate minimum received with slippage
    const minReceived = outputAmount * (1 - slippage / 100);

    // Calculate LP fee (0.3% standard)
    const lpFee = amount * 0.003;

    setToAmount(outputAmount.toFixed(6));
    setPriceImpact(impact);
    setExchangeRate(adjustedRate);
    setMinimumReceived(minReceived.toFixed(6));
    setLiquidityProviderFee(lpFee.toFixed(6));
    setRoutePath([fromToken.symbol, toToken.symbol]);
  };

  // Handle token swap
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    // Recalculate with swapped tokens
    setTimeout(() => calculateSwapDetails(toAmount), 100);
  };

  // Execute swap
  const handleSwap = async () => {
    if (!validateSwap()) return;

    setIsLoading(true);
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setPriceImpact(null);
      setExchangeRate(null);
      setMinimumReceived('');
      setLiquidityProviderFee('');
      
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update calculations when amount changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateSwapDetails(fromAmount);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken, slippage]);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Exchange
        </h2>
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

      {/* Swap Interface */}
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
              relative group
            "
          >
            <ArrowUpDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-purple-400" />
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

      {/* Swap Details */}
      {fromAmount && parseFloat(fromAmount) > 0 && toAmount && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3"
        >
          {/* Price Impact Warning */}
          {priceImpact && priceImpact > 2 && (
            <div className={`
              p-3 rounded-xl border flex items-center gap-2
              ${priceImpact > 5 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-yellow-500/10 border-yellow-500/20'
              }
            `}>
              <AlertTriangle className={`
                w-4 h-4 flex-shrink-0
                ${priceImpact > 5 ? 'text-red-400' : 'text-yellow-400'}
              `} />
              <span className={`
                text-sm
                ${priceImpact > 5 ? 'text-red-400' : 'text-yellow-400'}
              `}>
                {priceImpact > 5 ? 'High' : 'Medium'} Price Impact: {priceImpact.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Swap Details */}
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Exchange Rate</span>
                <span className="text-white font-medium">
                  1 {fromToken.symbol} = {exchangeRate?.toFixed(6)} {toToken.symbol}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Minimum Received</span>
                <span className="text-white font-medium">
                  {minimumReceived} {toToken.symbol}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Liquidity Provider Fee</span>
                <span className="text-white font-medium">
                  {liquidityProviderFee} {fromToken.symbol}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Slippage Tolerance</span>
                <span className="text-white font-medium">{slippage}%</span>
              </div>

              {routePath.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Route</span>
                  <span className="text-white font-medium">
                    {routePath.join(' → ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Swap Button */}
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
            ? 'Connect Wallet to Swap'
            : isLoading 
            ? 'Swapping...'
            : 'Swap'
          }
        </span>
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
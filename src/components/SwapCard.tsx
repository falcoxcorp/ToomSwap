import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings, Info, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import SettingsModal from './SettingsModal';
import { Token, NATIVE_TOKEN, USDT_TOKEN } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const SwapCard: React.FC = () => {
  const { account, signer, chainId, provider } = useWeb3();
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
  const [isCalculating, setIsCalculating] = useState(false);

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

  // Enhanced swap calculation with better price simulation
  const calculateSwapDetails = async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setToAmount('');
      setPriceImpact(null);
      setExchangeRate(null);
      setMinimumReceived('');
      setLiquidityProviderFee('');
      setRoutePath([]);
      return;
    }

    setIsCalculating(true);
    
    try {
      const amount = parseFloat(inputAmount);
      
      // Enhanced mock exchange rate calculation
      let rate = 1.0;
      let directPair = true;
      let path = [fromToken.symbol, toToken.symbol];
      
      // Direct pairs
      if (fromToken.symbol === 'SUPRA' && toToken.symbol === 'USDT') {
        rate = 0.85;
      } else if (fromToken.symbol === 'USDT' && toToken.symbol === 'SUPRA') {
        rate = 1.18;
      } else if (fromToken.symbol === 'WSUPRA' && toToken.symbol === 'SUPRA') {
        rate = 1.0;
      } else if (fromToken.symbol === 'SUPRA' && toToken.symbol === 'WSUPRA') {
        rate = 1.0;
      } else if (fromToken.symbol === 'WSUPRA' && toToken.symbol === 'USDT') {
        rate = 0.85;
      } else if (fromToken.symbol === 'USDT' && toToken.symbol === 'WSUPRA') {
        rate = 1.18;
      } else if (fromToken.symbol === 'TOON' && toToken.symbol === 'SUPRA') {
        rate = 0.14; // 0.12 USD / 0.85 USD
      } else if (fromToken.symbol === 'SUPRA' && toToken.symbol === 'TOON') {
        rate = 7.08; // 0.85 USD / 0.12 USD
      } else if (fromToken.symbol === 'TOON' && toToken.symbol === 'USDT') {
        rate = 0.12; // Direct TOON to USDT
      } else if (fromToken.symbol === 'USDT' && toToken.symbol === 'TOON') {
        rate = 8.33; // 1 USD / 0.12 USD
      } else {
        // Indirect pairs through SUPRA
        directPair = false;
        path = [fromToken.symbol, 'SUPRA', toToken.symbol];
        
        // Calculate rate through SUPRA
        let toSupraRate = 1.0;
        let fromSupraRate = 1.0;
        
        // From token to SUPRA
        if (fromToken.symbol === 'USDT') toSupraRate = 1.18;
        else if (fromToken.symbol === 'WSUPRA') toSupraRate = 1.0;
        else if (fromToken.symbol === 'TOON') toSupraRate = 0.14;
        
        // SUPRA to target token
        if (toToken.symbol === 'USDT') fromSupraRate = 0.85;
        else if (toToken.symbol === 'WSUPRA') fromSupraRate = 1.0;
        else if (toToken.symbol === 'TOON') fromSupraRate = 7.08;
        
        rate = toSupraRate * fromSupraRate;
      }

      // Calculate price impact based on trade size and liquidity
      let impact = 0;
      const liquidityMultiplier = directPair ? 1 : 1.5; // Higher impact for indirect pairs
      
      if (amount > 10000) impact = 4.5 * liquidityMultiplier;
      else if (amount > 5000) impact = 3.2 * liquidityMultiplier;
      else if (amount > 1000) impact = 2.1 * liquidityMultiplier;
      else if (amount > 500) impact = 1.2 * liquidityMultiplier;
      else if (amount > 100) impact = 0.8 * liquidityMultiplier;
      else if (amount > 10) impact = 0.3 * liquidityMultiplier;
      else impact = 0.1 * liquidityMultiplier;

      // Apply price impact to rate
      const adjustedRate = rate * (1 - impact / 100);
      const outputAmount = amount * adjustedRate;

      // Calculate minimum received with slippage
      const minReceived = outputAmount * (1 - slippage / 100);

      // Calculate LP fee (0.3% for direct pairs, 0.6% for indirect)
      const feeRate = directPair ? 0.003 : 0.006;
      const lpFee = amount * feeRate;

      setToAmount(outputAmount.toFixed(6));
      setPriceImpact(impact);
      setExchangeRate(adjustedRate);
      setMinimumReceived(minReceived.toFixed(6));
      setLiquidityProviderFee(lpFee.toFixed(6));
      setRoutePath(path);
      
    } catch (error) {
      console.error('Error calculating swap details:', error);
      setToAmount('');
      setPriceImpact(null);
      setExchangeRate(null);
      setMinimumReceived('');
      setLiquidityProviderFee('');
      setRoutePath([]);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle token swap with proper state management
  const handleSwapTokens = () => {
    console.log('Swapping tokens:', fromToken.symbol, '<->', toToken.symbol);
    
    // Store current values
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    // Swap tokens
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Swap amounts
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    // Recalculate with swapped tokens
    setTimeout(() => {
      if (toAmount && parseFloat(toAmount) > 0) {
        calculateSwapDetails(toAmount);
      }
    }, 100);
  };

  // Execute swap with enhanced simulation
  const handleSwap = async () => {
    if (!validateSwap()) return;

    setIsLoading(true);
    try {
      // Enhanced transaction simulation
      toast.loading('Preparing transaction...', { id: 'swap-loading' });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.loading('Confirming transaction...', { id: 'swap-loading' });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss('swap-loading');
      toast.success(
        `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`,
        { duration: 5000 }
      );
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setPriceImpact(null);
      setExchangeRate(null);
      setMinimumReceived('');
      setLiquidityProviderFee('');
      setRoutePath([]);
      
    } catch (error) {
      console.error('Swap failed:', error);
      toast.dismiss('swap-loading');
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

  const isSwapDisabled = !account || !fromAmount || parseFloat(fromAmount) <= 0 || isLoading || isCalculating;

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
        />

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapTokens}
            disabled={isLoading || isCalculating}
            className="
              p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10
              border border-white/10 transition-all duration-200
              relative group disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <ArrowUpDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-purple-400" />
            {isCalculating && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-purple-500/30 border-t-purple-500 rounded-xl"
              />
            )}
          </motion.button>
        </div>

        <CurrencyInput
          label="To"
          value={toAmount}
          onValueChange={setToAmount}
          selectedToken={toToken}
          onTokenChange={setToToken}
          otherToken={fromToken}
          readOnly
          showMaxButton={false}
        />
      </div>

      {/* Swap Details */}
      {fromAmount && parseFloat(fromAmount) > 0 && toAmount && !isCalculating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3"
        >
          {/* Price Impact Warning */}
          {priceImpact && priceImpact > 1 && (
            <div className={`
              p-3 rounded-xl border flex items-center gap-2
              ${priceImpact > 5 
                ? 'bg-red-500/10 border-red-500/20' 
                : priceImpact > 3
                ? 'bg-orange-500/10 border-orange-500/20'
                : 'bg-yellow-500/10 border-yellow-500/20'
              }
            `}>
              <AlertTriangle className={`
                w-4 h-4 flex-shrink-0
                ${priceImpact > 5 
                  ? 'text-red-400' 
                  : priceImpact > 3
                  ? 'text-orange-400'
                  : 'text-yellow-400'
                }
              `} />
              <span className={`
                text-sm
                ${priceImpact > 5 
                  ? 'text-red-400' 
                  : priceImpact > 3
                  ? 'text-orange-400'
                  : 'text-yellow-400'
                }
              `}>
                {priceImpact > 5 ? 'High' : priceImpact > 3 ? 'Medium' : 'Low'} Price Impact: {priceImpact.toFixed(2)}%
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
                  <span className="text-white font-medium text-right">
                    {routePath.join(' → ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading state for calculations */}
      {isCalculating && fromAmount && parseFloat(fromAmount) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
            />
            <span className="text-sm">Calculating best price...</span>
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
          flex items-center justify-center gap-2
        "
      >
        {isLoading && (
          <motion.div
            animate={{ x: [-100, 400] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
        <span className="relative flex items-center gap-2">
          {isLoading && <Zap className="w-4 h-4 animate-pulse" />}
          {!account 
            ? 'Connect Wallet to Swap'
            : isLoading 
            ? 'Swapping...'
            : isCalculating
            ? 'Calculating...'
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
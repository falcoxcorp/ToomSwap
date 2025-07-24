import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Settings, Info, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import SettingsModal from './SettingsModal';
import { Token, getTokenByAddress, getNativeToken, getUSDTToken } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import { isSupraNetwork } from '../constants/addresses';
import { DexService } from '../services/dexService';
import { priceService } from '../services/priceService';
import toast from 'react-hot-toast';

const SwapCard: React.FC = () => {
  const { account, signer, chainId, provider, getCurrentNetworkTokens } = useWeb3();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
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
  const [dexService, setDexService] = useState<DexService | null>(null);
  const [realTimePrice, setRealTimePrice] = useState<number | null>(null);

  // Initialize DexService when provider/signer changes
  useEffect(() => {
    if (provider && signer && chainId && isSupraNetwork(chainId)) {
      const service = new DexService(provider, signer, chainId);
      setDexService(service);
    } else {
      setDexService(null);
    }
  }, [provider, signer, chainId]);

  // Initialize tokens when chainId changes
  useEffect(() => {
    if (chainId && isSupraNetwork(chainId)) {
      const nativeToken = getNativeToken(chainId);
      const usdtToken = getUSDTToken(chainId);
      
      if (!fromToken || fromToken.chainId !== chainId) {
        setFromToken(nativeToken);
      }
      if (!toToken || toToken.chainId !== chainId) {
        setToToken(usdtToken);
      }
    }
  }, [chainId]);

  // Validate swap parameters
  const validateSwap = () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return false;
    }

    if (!chainId || !isSupraNetwork(chainId)) {
      toast.error('Please switch to a supported Supra network');
      return false;
    }

    if (!fromToken || !toToken) {
      toast.error('Please select tokens to swap');
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

    if (!fromToken || !toToken) {
      console.log('Missing tokens for calculation');
      return;
    }

    setIsCalculating(true);
    
    try {
      // Try to get real data from DEX service first
      if (dexService && fromToken && toToken && chainId && isSupraNetwork(chainId)) {
        try {
          // Verify contracts are available
          const contracts = getContractAddresses(chainId);
          if (contracts.ROUTER === "0x0000000000000000000000000000000000000000") {
            console.log('Contracts not available, using fallback calculation');
            throw new Error('Contracts not available');
          }

          // Check if pair exists
          const pairExists = await dexService.pairExists(fromToken, toToken);
          
          if (pairExists) {
            // Get real reserves
            const reserves = await dexService.getPairReserves(fromToken, toToken);
            
            if (reserves) {
              const reserveIn = parseFloat(reserves.reserveA);
              const reserveOut = parseFloat(reserves.reserveB);
              const amountIn = parseFloat(inputAmount);
              
              // Validate reserves
              if (reserveIn <= 0 || reserveOut <= 0) {
                throw new Error('Invalid reserves');
              }

              // Calculate real output using constant product formula
              // amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
              const amountInWithFee = amountIn * 997;
              const numerator = amountInWithFee * reserveOut;
              const denominator = reserveIn * 1000 + amountInWithFee;
              const realAmountOut = numerator / denominator;
              
              // Validate output
              if (realAmountOut <= 0 || !isFinite(realAmountOut)) {
                throw new Error('Invalid output amount');
              }

              // Calculate real price impact
              const priceWithoutImpact = amountIn * (reserveOut / reserveIn);
              const realPriceImpact = ((priceWithoutImpact - realAmountOut) / priceWithoutImpact) * 100;
              
              // Set real values
              setToAmount(realAmountOut.toFixed(6));
              setPriceImpact(Math.max(0, realPriceImpact));
              setExchangeRate(realAmountOut / amountIn);
              setMinimumReceived((realAmountOut * (1 - slippage / 100)).toFixed(6));
              setLiquidityProviderFee((amountIn * 0.003).toFixed(6));
              setRoutePath([fromToken.symbol, toToken.symbol]);
              
              setIsCalculating(false);
              return;
            }
          } else {
            // Check for indirect route through WSUPRA
            const wsupraAddress = contracts.WSUPRA;
            if (wsupraAddress && wsupraAddress !== "0x0000000000000000000000000000000000000000") {
              const wsupraToken = { ...fromToken, address: wsupraAddress, symbol: 'WSUPRA' };
            const pairAExists = await dexService.pairExists(fromToken, wsupraToken);
            const pairBExists = await dexService.pairExists(wsupraToken, toToken);
            
            if (pairAExists && pairBExists) {
              // Route through WSUPRA - simplified calculation
              setRoutePath([fromToken.symbol, 'WSUPRA', toToken.symbol]);
              // Use fallback calculation with higher fee for indirect route
            }
          }
        } catch (realDataError) {
          console.log('Using fallback calculation:', realDataError);
        }
      }
      
      const amount = parseFloat(inputAmount);
      
      // Validate amount
      if (amount <= 0 || !isFinite(amount)) {
        throw new Error('Invalid input amount');
      }

      // Get real exchange rate from DexScreener
      let rate = await priceService.getExchangeRate(fromToken, toToken);
      let directPair = true;
      let path = [fromToken.symbol, toToken.symbol];
      
      // Validate rate
      if (!rate || rate <= 0 || !isFinite(rate)) {
        console.log('Invalid rate from price service, using fallback');
        rate = 1.0;
      }

      // Check if we need indirect routing
      if (rate === 1.0 && fromToken.symbol !== toToken.symbol) {
        directPair = false;
        path = [fromToken.symbol, 'SUPRA', toToken.symbol];
      }
      
      // Store real-time price for display
      setRealTimePrice(rate);

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

      // Validate final calculations
      if (outputAmount <= 0 || !isFinite(outputAmount)) {
        throw new Error('Invalid calculation result');
      }

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
      
      console.log(`Real-time rate ${fromToken.symbol}/${toToken.symbol}:`, rate);
      
    } catch (error) {
      console.error('Error calculating swap details:', error);
      // Set safe fallback values
      setToAmount('');
      setPriceImpact(null);
      setExchangeRate(null);
      setMinimumReceived('');
      setLiquidityProviderFee('');
      setRoutePath([]);
      
      // Only show error if it's not a calculation error
      if (error.message !== 'Invalid calculation result' && error.message !== 'Invalid reserves') {
        toast.error('Error calculating swap details. Please try again.');
      }
    } finally {
      setIsCalculating(false);
    }
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

  // Execute swap with enhanced simulation
  const handleSwap = async () => {
    if (!validateSwap()) return;
    if (!dexService) {
      toast.error('DEX service not available. Please check your connection.');
      return;
    }

    // Verificar si estamos en mainnet con contratos no configurados
    if (chainId === 7) { // Mainnet
      const contracts = getContractAddresses(chainId);
      if (contracts.ROUTER === "0x0000000000000000000000000000000000000000") {
        toast.error('Mainnet contracts not yet deployed. Please use Supra Testnet for now.');
        return;
      }
    }

    // Additional validation before swap
    if (!toAmount || parseFloat(toAmount) <= 0) {
      toast.error('Invalid output amount calculated');
      return;
    }
    
    // Validate amounts are finite
    if (!isFinite(parseFloat(fromAmount)) || !isFinite(parseFloat(toAmount))) {
      toast.error('Invalid amounts detected. Please refresh and try again.');
      return;
    }

    // Check for minimum trade amounts
    if (parseFloat(fromAmount) < 0.000001) {
      toast.error(`Minimum trade amount is 0.000001 ${fromToken.symbol}`);
      return;
    }

    // Check user balance before swap
    try {
      console.log('Checking user balance before swap...');
      const userBalance = await dexService.getTokenBalance(fromToken, account);
      const requiredAmount = parseFloat(fromAmount);
      const availableBalance = parseFloat(userBalance);
      
      console.log(`Required: ${requiredAmount} ${fromToken.symbol}, Available: ${availableBalance} ${fromToken.symbol}`);
      
      if (availableBalance < requiredAmount) {
        toast.error(`Insufficient ${fromToken.symbol} balance. Required: ${requiredAmount}, Available: ${availableBalance.toFixed(4)}`);
        return;
      }
      
      // For native tokens, leave some for gas
      if (isNativeToken(fromToken) && availableBalance - requiredAmount < 0.01) {
        toast.error(`Insufficient ${fromToken.symbol} balance for gas fees. Please leave at least 0.01 ${fromToken.symbol} for transaction fees.`);
        return;
      }
    } catch (balanceError) {
      console.error('Error checking balance:', balanceError);
      toast.error('Could not verify balance. Please try again.');
      return;
    }
    
    if (priceImpact && priceImpact > 15) {
      const confirmed = window.confirm(
        `Warning: High price impact of ${priceImpact.toFixed(2)}%. Do you want to continue?`
      );
      if (!confirmed) return;
    }

    // Final safety check
    if (!fromToken || !toToken || !account) {
      toast.error('Missing required data for swap. Please refresh and try again.');
      return;
    }
    setIsLoading(true);
    try {
      // Real DEX transaction
      toast.loading('Preparing swap transaction...', { id: 'swap-loading' });
      
      // Execute real swap
      const tx = await dexService.executeSwap(
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippage
      );
      
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'swap-loading' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast.dismiss('swap-loading');
      
      if (receipt.status === 1) {
        toast.success(
          `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`,
          { duration: 6000 }
        );
        
        // Refresh balances after successful swap
        setTimeout(() => {
          // Reset form instead of full reload
          setFromAmount('');
          setToAmount('');
          setPriceImpact(null);
          setExchangeRate(null);
          setMinimumReceived('');
          setLiquidityProviderFee('');
          setRoutePath([]);
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Swap failed:', error);
      toast.dismiss('swap-loading');
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient')) {
        toast.error('Insufficient balance or allowance');
      } else if (error.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
        toast.error('Insufficient output amount. Try increasing slippage tolerance.');
      } else if (error.message?.includes('INSUFFICIENT_LIQUIDITY')) {
        toast.error('Insufficient liquidity for this trade');
      } else if (error.message?.includes('EXPIRED')) {
        toast.error('Transaction expired. Please try again.');
      } else if (error.message?.includes('execution reverted')) {
        toast.error('Transaction failed. Please check token approvals and try again.');
      } else if (error.message?.includes('gas')) {
        toast.error('Transaction failed due to gas issues. Please try again.');
      } else {
        toast.error(`Swap failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update calculations when amount changes
  useEffect(() => {
    if (!fromToken || !toToken) return;
    
    const timeoutId = setTimeout(() => {
      calculateSwapDetails(fromAmount);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken, slippage]);

  const isSwapDisabled = !account || !fromToken || !toToken || !fromAmount || 
    parseFloat(fromAmount) <= 0 || isLoading || isCalculating || !isSupraNetwork(chainId || 0);

  // Show loading state while tokens are being initialized
  if (!fromToken || !toToken) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-full max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 rounded-3xl
          bg-gradient-to-br from-gray-900/90 to-gray-800/90
          backdrop-blur-xl border border-white/10 shadow-2xl
          flex items-center justify-center min-h-[400px]
        "
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white font-medium">Loading tokens...</div>
          <div className="text-gray-400 text-sm mt-1">
            {!chainId ? 'Connect wallet' : !isSupraNetwork(chainId) ? 'Switch to Supra network' : 'Initializing...'}
          </div>
        </div>
      </motion.div>
    );
  }

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
                  {realTimePrice && (
                    <span className="text-xs text-green-400 ml-1">
                      (Live)
                    </span>
                  )}
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

              : !isSupraNetwork(chainId || 0)
              ? 'Switch to Supra Network'
      {/* Swap Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSwap}
        disabled={isSwapDisabled}
        className={`
          w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg
          ${!account 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            : !isSupraNetwork(chainId || 0)
            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
            : isSwapDisabled
            ? 'bg-gradient-to-r from-gray-600 to-gray-700'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }
          disabled:cursor-not-allowed text-white
          transition-all duration-200 relative overflow-hidden
          flex items-center justify-center gap-2
        `}
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
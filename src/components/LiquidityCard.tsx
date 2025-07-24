import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Info, AlertTriangle, Droplets, Zap } from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import { Token, NATIVE_TOKEN, USDT_TOKEN } from '../constants/tokens';
import { useWeb3 } from '../context/Web3Context';
import { DexService } from '../services/dexService';
import { priceService } from '../services/priceService';
import toast from 'react-hot-toast';

interface LiquidityCardProps {
  onBack: () => void;
}

const LiquidityCard: React.FC<LiquidityCardProps> = ({ onBack }) => {
  const { account, signer, chainId, provider } = useWeb3();
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [dexService, setDexService] = useState<DexService | null>(null);
  const [totalUSDValue, setTotalUSDValue] = useState<number>(0);

  // Initialize DexService when provider/signer changes
  useEffect(() => {
    if (provider && signer && chainId) {
      const service = new DexService(provider, signer, chainId);
      setDexService(service);
    } else {
      setDexService(null);
    }
  }, [provider, signer, chainId]);

  // Enhanced validation for liquidity addition
  const validateLiquidity = () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!provider || !signer) {
      toast.error('Wallet connection error. Please reconnect your wallet.');
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
      toast.error('Please switch to Supra network (Chain ID: 8)');
      return false;
    }

    // Check for minimum amounts
    const minAmountA = parseFloat(amountA);
    const minAmountB = parseFloat(amountB);
    
    if (minAmountA < 0.000001) {
      toast.error(`Minimum ${tokenA.symbol} amount is 0.000001`);
      return false;
    }

    if (minAmountB < 0.000001) {
      toast.error(`Minimum ${tokenB.symbol} amount is 0.000001`);
      return false;
    }

    return true;
  };

  // Enhanced liquidity calculation with better simulation
  const calculateLiquidityDetails = async () => {
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      setLpTokensToReceive('');
      setPriceImpact(0);
      setYourShare(0);
      setPoolRatio('1:1');
      setPoolExists(true);
      setTotalUSDValue(0);
      return;
    }

    setIsCalculating(true);

    try {
      // Try to get real pool data if available
      if (dexService && tokenA && tokenB) {
        try {
          const pairExists = await dexService.pairExists(tokenA, tokenB);
          setPoolExists(pairExists);
          
          if (pairExists) {
            const reserves = await dexService.getPairReserves(tokenA, tokenB);
            if (reserves) {
              const reserveA = parseFloat(reserves.reserveA);
              const reserveB = parseFloat(reserves.reserveB);
              const amtA = parseFloat(amountA);
              const amtB = parseFloat(amountB);
              
              // Validate amounts against pool ratio for existing pools
              const poolRatio = reserveA / reserveB;
              const inputRatio = amtA / amtB;
              const ratioDifference = Math.abs(poolRatio - inputRatio) / poolRatio;
              
              if (ratioDifference > 0.02) { // 2% tolerance
                // Auto-adjust amountB to match pool ratio
                const adjustedAmountB = amtA / poolRatio;
                setAmountB(adjustedAmountB.toFixed(6));
                return; // Recalculate with adjusted amount
              }
              
              // Calculate real pool ratio
              const ratio = (reserveA / reserveB).toFixed(4);
              setPoolRatio(`${ratio}:1`);
              
              // Calculate LP tokens using real reserves
              // For existing pools, LP tokens = min(amountA/reserveA, amountB/reserveB) * totalSupply
              // Simplified calculation for demo
              const lpTokens = Math.sqrt(amtA * amtB);
              const totalLiquidity = Math.sqrt(reserveA * reserveB);
              const share = (lpTokens / (totalLiquidity + lpTokens)) * 100;
              
              setLpTokensToReceive(lpTokens.toFixed(6));
              setYourShare(share);
              
              // Calculate price impact
              const liquidityImpact = ((amtA + amtB) / (reserveA + reserveB)) * 100;
              const impact = Math.min(liquidityImpact, 10); // Cap at 10%
              setPriceImpact(impact);
              
              setIsCalculating(false);
              return;
            }
          }
        } catch (realDataError) {
          console.log('Using fallback calculation due to:', realDataError);
        }
      }

      const amtA = parseFloat(amountA);
      const amtB = parseFloat(amountB);

      // Get real USD values for both tokens
      const [usdValueA, usdValueB] = await Promise.all([
        priceService.getUSDValue(tokenA, amountA),
        priceService.getUSDValue(tokenB, amountB)
      ]);
      
      const totalUSD = usdValueA + usdValueB;
      setTotalUSDValue(totalUSD);

      // Enhanced pool simulation based on token pairs
      let mockTotalLiquidity = 1000000;
      let baseRatio = 1.0;

      // Get real exchange rate
      baseRatio = await priceService.getExchangeRate(tokenA, tokenB);
      
      // Estimate liquidity based on USD value
      if (totalUSD > 100000) mockTotalLiquidity = 5000000;
      else if (totalUSD > 50000) mockTotalLiquidity = 2500000;
      else if (totalUSD > 10000) mockTotalLiquidity = 1000000;
      else mockTotalLiquidity = 500000;

      // Calculate LP tokens using constant product formula
      const lpTokens = Math.sqrt(amtA * amtB * baseRatio);
      
      // Calculate pool share
      const share = (lpTokens / (mockTotalLiquidity + lpTokens)) * 100;
      
      // Calculate price impact for large additions
      let impact = 0;
      const liquidityRatio = (amtA + amtB) / mockTotalLiquidity;
      
      if (liquidityRatio > 0.1) impact = 5.5;
      else if (liquidityRatio > 0.05) impact = 3.2;
      else if (liquidityRatio > 0.01) impact = 1.8;
      else if (liquidityRatio > 0.005) impact = 0.8;
      else if (liquidityRatio > 0.001) impact = 0.3;
      else impact = 0.1;

      // Update pool ratio
      const ratio = (amtA / amtB).toFixed(4);
      
      setLpTokensToReceive(lpTokens.toFixed(6));
      setPriceImpact(impact);
      setYourShare(share);
      setPoolRatio(`${ratio}:1`);

      // Check if pool exists (simulate based on token pair popularity)
      const popularPairs = ['SUPRA-USDT', 'WSUPRA-SUPRA', 'SUPRA-TOON'];
      const pairKey = `${tokenA.symbol}-${tokenB.symbol}`;
      setPoolExists(popularPairs.includes(pairKey) || popularPairs.includes(`${tokenB.symbol}-${tokenA.symbol}`));

    } catch (error) {
      console.error('Error calculating liquidity details:', error);
      setLpTokensToReceive('');
      setPriceImpact(0);
      setYourShare(0);
      setPoolRatio('1:1');
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle amount changes with auto-calculation for existing pools
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    
    if (poolExists && value && parseFloat(value) > 0) {
      // Auto-calculate amount B based on current pool ratio
      const calculatedB = (parseFloat(value) * 1.18).toFixed(6); // Mock ratio
      setAmountB(calculatedB);
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    
    if (poolExists && value && parseFloat(value) > 0) {
      // Auto-calculate amount A based on current pool ratio
      const calculatedA = (parseFloat(value) * 0.85).toFixed(6); // Mock ratio
      setAmountA(calculatedA);
    }
  };

  // Enhanced add liquidity with comprehensive error handling
  const handleAddLiquidity = async () => {
    if (!validateLiquidity()) return;
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

    // Additional validations
    if (priceImpact > 10) {
      const confirmed = window.confirm(
        `Warning: High price impact of ${priceImpact.toFixed(2)}%. Do you want to continue?`
      );
      if (!confirmed) return;
    }

    // Validate amounts are finite
    if (!isFinite(parseFloat(amountA)) || !isFinite(parseFloat(amountB))) {
      toast.error('Invalid amounts detected. Please refresh and try again.');
      return;
    }

    // Check minimum amounts
    if (parseFloat(amountA) < 0.000001 || parseFloat(amountB) < 0.000001) {
      toast.error('Minimum liquidity amount is 0.000001 for each token');
      return;
    }

    setIsLoading(true);
    try {
      // Real liquidity addition
      toast.loading('Preparing liquidity transaction...', { id: 'liquidity-loading' });
      
      // Check balances before adding liquidity
      const balanceA = await dexService.getTokenBalance(tokenA, account);
      const balanceB = await dexService.getTokenBalance(tokenB, account);
      
      if (parseFloat(balanceA) < parseFloat(amountA)) {
        throw new Error(`Insufficient ${tokenA.symbol} balance`);
      }
      
      if (parseFloat(balanceB) < parseFloat(amountB)) {
        throw new Error(`Insufficient ${tokenB.symbol} balance`);
      }
      
      // Execute real liquidity addition
      const tx = await dexService.addLiquidity(
        tokenA,
        tokenB,
        amountA,
        amountB,
        0.5 // 0.5% slippage tolerance
      );
      
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'liquidity-loading' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast.dismiss('liquidity-loading');
      
      if (receipt.status === 1) {
        toast.success(
          `Successfully added liquidity! Added ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol} to the pool`,
          { duration: 6000 }
        );
        
        // Reset form instead of full reload
        setAmountA('');
        setAmountB('');
        setLpTokensToReceive('');
        setPriceImpact(0);
        setYourShare(0);
        setPoolRatio('1:1');
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Add liquidity failed:', error);
      toast.dismiss('liquidity-loading');
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient')) {
        toast.error('Insufficient balance or allowance');
      } else if (error.message?.includes('INSUFFICIENT_LIQUIDITY_MINTED')) {
        toast.error('Insufficient liquidity minted. Try adjusting amounts.');
      } else if (error.message?.includes('INSUFFICIENT_A_AMOUNT') || error.message?.includes('INSUFFICIENT_B_AMOUNT')) {
        toast.error('Insufficient token amount. Try reducing slippage tolerance.');
      } else if (error.message?.includes('execution reverted')) {
        toast.error('Transaction failed. Please check token approvals and try again.');
      } else if (error.message?.includes('gas')) {
        toast.error('Transaction failed due to gas issues. Please try again.');
      } else {
        toast.error(`Failed to add liquidity: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update calculations when amounts or tokens change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateLiquidityDetails();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [amountA, amountB, tokenA, tokenB]);

  const isAddDisabled = !account || !amountA || !amountB || 
    parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0 || isLoading || isCalculating;

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

      {/* Network Warning */}
      {chainId !== 8 && account && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">
            Please switch to Supra network to add liquidity
          </span>
        </motion.div>
      )}

      {/* Pool Status */}
      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 text-sm text-blue-300">
          <div className={`w-2 h-2 rounded-full ${poolExists ? 'bg-blue-400' : 'bg-orange-400'}`} />
          {poolExists ? `${tokenA.symbol}/${tokenB.symbol} pool exists` : 'New pool will be created'}
        </div>
        {!poolExists && (
          <div className="text-xs text-blue-200 mt-1">
            You'll be the first liquidity provider for this pair
          </div>
        )}
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
        />

        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="
              p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10
              flex items-center justify-center
            "
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            {isCalculating && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
              />
            )}
          </motion.div>
        </div>

        <CurrencyInput
          label="Input"
          value={amountB}
          onValueChange={handleAmountBChange}
          selectedToken={tokenB}
          onTokenChange={setTokenB}
          otherToken={tokenA}
        />
      </div>

      {/* Liquidity Details */}
      {amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && !isCalculating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-3"
        >
          {/* Price Impact Warning */}
          {priceImpact > 1 && (
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
              {totalUSDValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Total USD Value</span>
                  <span className="text-white font-medium">
                    ${totalUSDValue.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              )}
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

      {/* Calculating state */}
      {isCalculating && amountA && amountB && parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
            />
            <span className="text-sm">Calculating liquidity details...</span>
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
            ? 'Connect Wallet'
            : chainId !== 8
            ? 'Switch to Supra Network'
            : isLoading 
            ? 'Adding Liquidity...'
            : isCalculating
            ? 'Calculating...'
            : 'Add Liquidity'
          }
        </span>
      </motion.button>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>
          By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool.
        </p>
      </div>
    </motion.div>
  );
};

export default LiquidityCard;
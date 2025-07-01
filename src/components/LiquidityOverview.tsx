import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Info, Droplets, Minus, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import RemoveLiquidityModal from './RemoveLiquidityModal';

interface LiquidityOverviewProps {
  onAddLiquidityV2: () => void;
  onAddLiquidityV3: () => void;
}

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
  fees24h: number;
}

const LiquidityOverview: React.FC<LiquidityOverviewProps> = ({ 
  onAddLiquidityV2, 
  onAddLiquidityV3 
}) => {
  const { account, chainId } = useWeb3();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock liquidity positions with enhanced data
  const liquidityPositions: LiquidityPosition[] = account ? [
    {
      id: '1',
      tokenA: 'SUPRA',
      tokenB: 'USDT',
      tokenAAmount: '1,250.00',
      tokenBAmount: '1,062.50',
      lpTokens: '1,150.25',
      share: 0.15,
      value: 2312.50,
      apy: 24.5,
      version: 'V2',
      fees24h: 12.45
    },
    {
      id: '2',
      tokenA: 'WSUPRA',
      tokenB: 'USDC',
      tokenAAmount: '850.00',
      tokenBAmount: '722.50',
      lpTokens: '785.12',
      share: 0.08,
      value: 1572.50,
      apy: 18.2,
      version: 'V3',
      fees24h: 8.32
    },
    {
      id: '3',
      tokenA: 'TOON',
      tokenB: 'SUPRA',
      tokenAAmount: '5,000.00',
      tokenBAmount: '600.00',
      lpTokens: '1,732.05',
      share: 0.12,
      value: 1110.00,
      apy: 35.8,
      version: 'V2',
      fees24h: 15.67
    }
  ] : [];

  const handleRemoveLiquidity = (position: LiquidityPosition) => {
    setSelectedPosition(position);
    setShowRemoveModal(true);
  };

  const totalValue = liquidityPositions.reduce((sum, pos) => sum + pos.value, 0);
  const averageAPY = liquidityPositions.length > 0 
    ? liquidityPositions.reduce((sum, pos) => sum + pos.apy, 0) / liquidityPositions.length 
    : 0;
  const totalFees24h = liquidityPositions.reduce((sum, pos) => sum + pos.fees24h, 0);

  // Simulate loading state
  useEffect(() => {
    if (account) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [account]);

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
          <Droplets className="w-5 h-5 text-blue-400" />
          Liquidity
        </h2>
        <div className="flex items-center gap-2">
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

      {/* Network Status */}
      {chainId !== 8 && account && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-sm text-orange-300">
            Please switch to Supra network to view liquidity positions
          </span>
        </motion.div>
      )}

      {/* Portfolio Summary */}
      {account && liquidityPositions.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total Value</div>
              <div className="text-lg sm:text-xl font-bold text-white">
                ${totalValue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Avg APY</div>
              <div className="text-lg sm:text-xl font-bold text-green-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {averageAPY.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">24h Fees</div>
              <div className="text-lg sm:text-xl font-bold text-purple-400 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                ${totalFees24h.toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Liquidity Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddLiquidityV2}
          className="
            flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base
            bg-gradient-to-r from-purple-600 to-blue-600
            hover:from-purple-700 hover:to-blue-700
            text-white transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          <Plus className="w-4 h-4" />
          Add V2 Liquidity
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddLiquidityV3}
          className="
            flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base
            bg-gradient-to-r from-pink-600 to-purple-600
            hover:from-pink-700 hover:to-purple-700
            text-white transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          <Plus className="w-4 h-4" />
          Add V3 Liquidity
        </motion.button>
      </div>

      {/* Liquidity Positions */}
      <div className="space-y-4">
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            Your Liquidity Positions
          </h3>
          
          {account ? (
            isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                      <div className="h-4 bg-gray-600 rounded w-16"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="h-3 bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-600 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-600 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : liquidityPositions.length > 0 ? (
              <div className="space-y-3">
                {liquidityPositions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="
                      p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10
                      hover:border-white/20 transition-all duration-200
                    "
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm sm:text-base font-bold text-white">
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
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-bold text-white">
                          ${position.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {position.apy}% APY
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                      <div>
                        <div className="text-gray-400 mb-1">{position.tokenA}</div>
                        <div className="text-white font-medium">{position.tokenAAmount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">{position.tokenB}</div>
                        <div className="text-white font-medium">{position.tokenBAmount}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                      <div>
                        <span className="text-gray-400">Pool Share: </span>
                        <span className="text-white font-medium">{position.share}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">24h Fees: </span>
                        <span className="text-purple-400 font-medium">${position.fees24h.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        LP Tokens: <span className="text-white font-medium">{position.lpTokens}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveLiquidity(position)}
                          className="
                            px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30
                            border border-red-500/30 text-red-300 hover:text-red-200
                            transition-all duration-200 flex items-center gap-1
                          "
                        >
                          <Minus className="w-3 h-3" />
                          Remove
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="
                            p-1.5 rounded-lg bg-white/5 hover:bg-white/10
                            border border-white/10 text-gray-400 hover:text-white
                            transition-all duration-200
                          "
                        >
                          <ExternalLink className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <div className="text-gray-400 mb-2 text-sm sm:text-base font-medium">
                  No liquidity positions found
                </div>
                <div className="text-gray-500 text-xs sm:text-sm">
                  Add liquidity to start earning fees
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <div className="text-gray-400 mb-2 text-sm sm:text-base font-medium">
                Connect wallet to view liquidity
              </div>
              <div className="text-gray-500 text-xs sm:text-sm">
                Connect your wallet to see your liquidity positions
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="text-xs sm:text-sm text-gray-400 space-y-2">
          <p>
            Don't see a pool you joined?{' '}
            <button className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Import it.
            </button>
          </p>
          <p>
            Or, if you staked your LP tokens in a farm, unstake them to see them here.
          </p>
        </div>
      </div>

      {/* Remove Liquidity Modal */}
      {selectedPosition && (
        <RemoveLiquidityModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedPosition(null);
          }}
          position={selectedPosition}
        />
      )}
    </motion.div>
  );
};

export default LiquidityOverview;
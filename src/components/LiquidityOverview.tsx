import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Info } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

interface LiquidityOverviewProps {
  onAddLiquidityV2: () => void;
  onAddLiquidityV3: () => void;
}

const LiquidityOverview: React.FC<LiquidityOverviewProps> = ({ 
  onAddLiquidityV2, 
  onAddLiquidityV3 
}) => {
  const { account } = useWeb3();

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
        <h2 className="text-lg sm:text-xl font-bold text-white">Liquidity</h2>
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

      <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
        Add liquidity to receive LP tokens
      </p>

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
          "
        >
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
          "
        >
          Add V3 Liquidity
        </motion.button>
      </div>

      <div className="space-y-4">
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Your V2 Liquidity</h3>
          
          {account ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 mb-4 text-sm">
                Connect to a wallet to view your liquidity.
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 mb-4 text-sm">
                Connect to a wallet to view your liquidity.
              </div>
            </div>
          )}
        </div>

        <div className="text-xs sm:text-sm text-gray-400">
          <p className="mb-2">
            Don't see a pool you joined?{' '}
            <button className="text-purple-400 hover:text-purple-300 transition-colors">
              Import it.
            </button>
          </p>
          <p>
            Or, if you staked your LP tokens in a farm, unstake them to see them here.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LiquidityOverview;
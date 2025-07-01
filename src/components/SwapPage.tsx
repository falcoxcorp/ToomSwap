import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import ConnectWalletButton from './ConnectWalletButton';
import Navigation from './Navigation';
import SwapCard from './SwapCard';
import LiquidityOverview from './LiquidityOverview';
import LiquidityCard from './LiquidityCard';
import Footer from './Footer';

interface SwapPageProps {
  onNavigateHome: () => void;
}

const SwapPage: React.FC<SwapPageProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity' | 'cross-swap' | 'bridge'>('swap');
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);

  const renderContent = () => {
    if (activeTab === 'liquidity') {
      if (showAddLiquidity) {
        return <LiquidityCard onBack={() => setShowAddLiquidity(false)} />;
      }
      return (
        <LiquidityOverview
          onAddLiquidityV2={() => setShowAddLiquidity(true)}
          onAddLiquidityV3={() => setShowAddLiquidity(true)}
        />
      );
    }

    if (activeTab === 'swap') {
      return <SwapCard />;
    }

    // Placeholder for other tabs
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-full max-w-sm sm:max-w-md mx-auto p-6 sm:p-8 rounded-3xl text-center
          bg-gradient-to-br from-gray-900/90 to-gray-800/90
          backdrop-blur-xl border border-white/10 shadow-2xl
        "
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Coming Soon</h3>
        <p className="text-sm sm:text-base text-gray-400">
          {activeTab === 'cross-swap' ? 'Cross-chain swapping' : 'Bridge functionality'} 
          {' '}will be available soon.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-40 flex items-center justify-between p-4 sm:p-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNavigateHome}
            className="
              p-2 rounded-xl bg-white/5 hover:bg-white/10
              border border-white/10 transition-colors
              flex items-center gap-2 text-white hover:text-purple-300
            "
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm font-medium">Back to Home</span>
          </motion.button>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center min-w-0"
          >
            <img 
              src="https://photos.pinksale.finance/file/pinksale-logo-upload/1751325718950-5662c9ae5d79628fc42380b8cf1b27f4.png"
              alt="ToonSwap Logo"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain max-w-[120px] sm:max-w-none"
              onError={(e) => {
                const fallback = document.createElement('div');
                fallback.className = 'h-8 sm:h-10 md:h-12 w-24 sm:w-28 md:w-32 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-sm sm:text-base md:text-lg">ToonSwap</span>';
                e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
              }}
            />
          </motion.div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateHome}
            className="
              hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
              bg-white/10 hover:bg-white/20 border border-white/20 text-white
              transition-all duration-200
            "
          >
            <Home className="w-4 h-4" />
            Home
          </motion.button>
          <ConnectWalletButton />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-30 container mx-auto px-4 sm:px-6 pb-8 sm:pb-12 flex-1">
        <div className="max-w-sm sm:max-w-md lg:max-w-2xl mx-auto">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderContent()}
        </div>

        {/* Transaction Success Notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 mx-auto max-w-sm
            p-3 sm:p-4 rounded-2xl bg-green-500/10 backdrop-blur-sm
            border border-green-500/20 text-center
            lg:left-auto lg:right-6 lg:max-w-sm z-20
          "
          style={{ display: 'none' }}
        >
          <div className="text-green-400 font-medium mb-1 text-sm sm:text-base">Transaction successful!</div>
          <button className="text-xs sm:text-sm text-green-300 hover:text-green-200 transition-colors">
            View on explorer
          </button>
          <div className="text-xs text-green-400 mt-2 italic">
            ToonSwap: Where your crypto journey takes flight!
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SwapPage;
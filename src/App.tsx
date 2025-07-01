import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import ConnectWalletButton from './components/ConnectWalletButton';
import Navigation from './components/Navigation';
import SwapCard from './components/SwapCard';
import LiquidityOverview from './components/LiquidityOverview';
import LiquidityCard from './components/LiquidityCard';
import Footer from './components/Footer';

function App() {
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
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex flex-col overflow-x-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-900" />
        <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%239C92AC%27%20fill-opacity%3D%270.05%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center justify-between p-4 sm:p-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center min-w-0"
          >
            <img 
              src="https://photos.pinksale.finance/file/pinksale-logo-upload/1751325718950-5662c9ae5d79628fc42380b8cf1b27f4.png"
              alt="ToonSwap Logo"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain max-w-[120px] sm:max-w-none"
              onError={(e) => {
                // Fallback to a simple colored div if image fails to load
                const fallback = document.createElement('div');
                fallback.className = 'h-8 sm:h-10 md:h-12 w-24 sm:w-28 md:w-32 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-sm sm:text-base md:text-lg">ToonSwap</span>';
                e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
              }}
            />
          </motion.div>
          
          <div className="flex-shrink-0">
            <ConnectWalletButton />
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 sm:px-6 pb-8 sm:pb-12 flex-1">
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
              lg:left-auto lg:right-6 lg:max-w-sm
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

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(17, 24, 39, 0.9)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              fontSize: '14px',
              maxWidth: '90vw',
            },
          }}
        />
      </div>
    </Web3Provider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Star, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { SUPRA_CHAIN } from '../constants/addresses';

const ConnectWalletButton: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnecting, chainId, walletType } = useWeb3();
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [isStarkeyDetected, setIsStarkeyDetected] = useState(false);

  const isWrongNetwork = chainId && chainId !== SUPRA_CHAIN.id;

  // Enhanced StarKey detection with periodic checks
  const checkStarkeyInstallation = () => {
    if (typeof window === 'undefined') return false;
    
    // Method 1: Check for window.starkey
    if (window.starkey && window.starkey.supra) {
      return true;
    }
    
    // Method 2: Check for ethereum provider with StarKey identifier
    if (window.ethereum && window.ethereum.isStarkey) {
      return true;
    }
    
    // Method 3: Check for StarKey in ethereum providers array
    if (window.ethereum && window.ethereum.providers) {
      return window.ethereum.providers.some((provider: any) => provider.isStarkey);
    }
    
    return false;
  };

  // Check StarKey installation on component mount and periodically
  useEffect(() => {
    const checkInstallation = () => {
      const detected = checkStarkeyInstallation();
      setIsStarkeyDetected(detected);
    };

    // Initial check
    checkInstallation();

    // Check every 2 seconds for StarKey installation
    const interval = setInterval(checkInstallation, 2000);

    // Also check when window gains focus (user might have installed StarKey)
    const handleFocus = () => {
      setTimeout(checkInstallation, 500);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleWalletSelect = async () => {
    setShowWalletOptions(false);
    await connectWallet('starkey');
  };

  const handleInstallStarkey = () => {
    // Redirect to StarKey Chrome Web Store page
    window.open('https://chromewebstore.google.com/detail/starkey-wallet-the-offici/hcjhpkgbmechpabifbggldplacolbkoh', '_blank');
    setShowWalletOptions(false);
  };

  const handleRefreshDetection = () => {
    const detected = checkStarkeyInstallation();
    setIsStarkeyDetected(detected);
    
    if (detected) {
      setShowWalletOptions(false);
    }
  };

  const getWalletDisplayName = () => {
    if (walletType === 'starkey') return 'StarKey';
    return 'Wallet';
  };

  if (account) {
    const shortAddress = `${account.slice(0, 4)}...${account.slice(-4)}`;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm
            backdrop-blur-sm border transition-all duration-200
            ${isWrongNetwork 
              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }
          `}
          onClick={disconnectWallet}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isWrongNetwork ? 'bg-red-400' : 'bg-green-400'}`} />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-gray-400 hidden sm:block">{getWalletDisplayName()}</span>
            <span className="truncate">{isWrongNetwork ? 'Wrong Network' : shortAddress}</span>
          </div>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isStarkeyDetected ? handleWalletSelect : () => setShowWalletOptions(true)}
        disabled={isConnecting}
        className="
          flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-white
          bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
          backdrop-blur-sm border border-white/10 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base
        "
      >
        <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">
          {isConnecting ? 'Connecting...' : isStarkeyDetected ? 'Connect StarKey' : 'Install StarKey'}
        </span>
        <span className="sm:hidden">
          {isConnecting ? 'Connecting...' : isStarkeyDetected ? 'Connect' : 'Install'}
        </span>
      </motion.button>

      {/* StarKey Installation Modal */}
      <AnimatePresence>
        {showWalletOptions && !isStarkeyDetected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowWalletOptions(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="
                absolute top-full mt-2 right-0 w-80 sm:w-96 overflow-hidden
                bg-gradient-to-br from-gray-900/98 to-gray-800/98 
                backdrop-blur-xl border border-white/20 rounded-2xl
                shadow-2xl z-50 max-h-[80vh] overflow-y-auto
              "
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    Install StarKey Wallet
                  </h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRefreshDetection}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      title="Refresh detection"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowWalletOptions(false)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="text-gray-400 text-lg sm:text-xl">×</span>
                    </motion.button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Detection Status */}
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-300">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                      StarKey wallet not detected
                    </div>
                  </div>

                  {/* StarKey Features */}
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm sm:text-base">StarKey Wallet</div>
                        <div className="text-xs sm:text-sm text-purple-300">Official Supra EVM Wallet</div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-200 mb-4">
                      StarKey is the native wallet for Supra EVM, designed specifically for optimal 
                      performance and security in the Supra ecosystem.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Native Supra EVM integration
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Enhanced security & privacy
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Optimized for DeFi trading
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Cross-chain capabilities
                      </div>
                    </div>
                  </div>

                  {/* Installation Steps */}
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-blue-400">📋</span>
                      Quick Installation
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">1.</span>
                        <span>Click "Install StarKey" below</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">2.</span>
                        <span>Add to Chrome from Web Store</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">3.</span>
                        <span>Create or import your wallet</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">4.</span>
                        <span>Click refresh button or reload page</span>
                      </div>
                    </div>
                  </div>

                  {/* Install Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInstallStarkey}
                    className="
                      w-full py-3 sm:py-4 px-4 rounded-xl font-semibold text-base sm:text-lg
                      bg-gradient-to-r from-purple-600 to-blue-600
                      hover:from-purple-700 hover:to-blue-700
                      text-white transition-all duration-200
                      flex items-center justify-center gap-2 sm:gap-3
                      shadow-lg hover:shadow-xl
                    "
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    Install StarKey Wallet
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>

                  {/* Footer Note */}
                  <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-300 mb-1">
                      🔒 Secure & Open Source
                    </p>
                    <p className="text-xs text-gray-400">
                      After installation, use the refresh button above or reload this page
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectWalletButton;
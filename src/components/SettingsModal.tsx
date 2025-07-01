import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (slippage: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  slippage, 
  onSlippageChange 
}) => {
  const [customSlippage, setCustomSlippage] = useState('');
  const [deadline, setDeadline] = useState(20);
  const [expertMode, setExpertMode] = useState(false);

  const presetSlippages = [0.1, 0.5, 1.0];

  const handleSlippageChange = (value: number) => {
    onSlippageChange(value);
    setCustomSlippage('');
  };

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="
              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-full max-w-sm sm:max-w-md p-4 sm:p-6 rounded-3xl z-50
              bg-gradient-to-br from-gray-900/95 to-gray-800/95
              backdrop-blur-xl border border-white/10 shadow-2xl
              max-h-[90vh] overflow-y-auto mx-4
            "
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Settings</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="
                  p-2 rounded-xl bg-white/5 hover:bg-white/10
                  border border-white/10 transition-colors
                "
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </motion.button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Slippage Tolerance */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-white text-sm sm:text-base">Slippage tolerance</span>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </div>
                
                <div className="flex gap-2 mb-3 flex-wrap">
                  {presetSlippages.map((preset) => (
                    <motion.button
                      key={preset}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSlippageChange(preset)}
                      className={`
                        px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all
                        ${slippage === preset && !customSlippage
                          ? 'bg-purple-600 text-white border border-purple-500'
                          : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      {preset}%
                    </motion.button>
                  ))}
                  
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <input
                      type="text"
                      value={customSlippage}
                      onChange={(e) => handleCustomSlippageChange(e.target.value)}
                      placeholder="1.0"
                      className="
                        bg-transparent text-xs sm:text-sm text-white w-8 sm:w-12 text-center
                        focus:outline-none placeholder-gray-400
                      "
                    />
                    <span className="text-xs sm:text-sm text-gray-400 ml-1">%</span>
                  </div>
                </div>
              </div>

              {/* Transaction Deadline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-white text-sm sm:text-base">Transaction deadline</span>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={deadline}
                    onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                    className="
                      w-16 sm:w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-xl
                      text-white text-center focus:outline-none focus:border-purple-500/50
                      text-sm
                    "
                  />
                  <span className="text-xs sm:text-sm text-gray-400">Minutes</span>
                </div>
              </div>

              {/* Expert Mode */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm sm:text-base">Expert Mode</span>
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpertMode(!expertMode)}
                    className="text-2xl"
                  >
                    {expertMode ? (
                      <ToggleRight className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    )}
                  </motion.button>
                </div>
                
                {expertMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
                  >
                    <p className="text-xs sm:text-sm text-orange-400">
                      Expert mode turns off transaction confirmations and allows high slippage trades.
                      Use at your own risk.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
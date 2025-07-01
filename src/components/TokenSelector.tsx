import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Star } from 'lucide-react';
import { Token, DEFAULT_TOKENS } from '../constants/tokens';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
  otherToken?: Token;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  selectedToken, 
  onSelectToken, 
  otherToken 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredTokens = DEFAULT_TOKENS.filter(token => 
    token.address !== otherToken?.address &&
    (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     token.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    // Focus search input after modal opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCloseModal();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Token Selector Button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenModal}
          className="
            flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl
            bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15
            border border-white/20 hover:border-white/30
            transition-all duration-200 min-w-[90px] sm:min-w-[110px] max-w-[120px] sm:max-w-[140px]
            shadow-lg hover:shadow-xl
          "
        >
          <div className="relative">
            <img 
              src={selectedToken.logoURI} 
              alt={selectedToken.symbol}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 ring-2 ring-white/10"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/24x24/6C5CE7/FFFFFF?text=' + selectedToken.symbol[0];
              }}
            />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-gray-900" />
          </div>
          <span className="font-semibold text-white text-xs sm:text-sm truncate flex-1 min-w-0">
            {selectedToken.symbol}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          </motion.div>
        </motion.button>
      </div>

      {/* Full Screen Modal Portal with MAXIMUM Z-INDEX */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4" 
            style={{ zIndex: 999999999 }} // MAXIMUM Z-INDEX
          >
            {/* Enhanced Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              style={{ zIndex: 999999998 }}
            />
            
            {/* Modal Container */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3
              }}
              className="
                w-full max-w-sm sm:max-w-lg max-h-[85vh] overflow-hidden
                bg-gradient-to-br from-gray-900/98 to-gray-800/98 
                backdrop-blur-2xl border border-white/20 rounded-3xl
                shadow-2xl relative
              "
              style={{ zIndex: 999999999 }} // MAXIMUM Z-INDEX
            >
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
              
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-gray-900/95 to-gray-800/95">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Select Token</h3>
                      <p className="text-xs sm:text-sm text-gray-400">Choose from available tokens</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseModal}
                    className="
                      p-2 sm:p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200
                      border border-white/10 hover:border-white/20
                    "
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </motion.button>
                </div>
                
                {/* Enhanced Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                      w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-2xl
                      text-white placeholder-gray-400 focus:outline-none 
                      focus:border-purple-500/50 focus:bg-white/10
                      transition-all duration-200 text-sm sm:text-base
                    "
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Token List */}
              <div className="max-h-80 sm:max-h-96 overflow-y-auto bg-gradient-to-b from-gray-900/95 to-gray-800/95">
                {filteredTokens.length > 0 ? (
                  <div className="p-2">
                    {filteredTokens.map((token, index) => (
                      <motion.button
                        key={token.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ 
                          scale: 1.02,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectToken(token)}
                        className="
                          w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left rounded-2xl
                          hover:bg-white/5 transition-all duration-200 mb-2
                          border border-transparent hover:border-white/10
                          group relative overflow-hidden
                        "
                      >
                        {/* Background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        
                        <div className="relative">
                          <img 
                            src={token.logoURI} 
                            alt={token.symbol}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-200"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48x48/6C5CE7/FFFFFF?text=' + token.symbol[0];
                            }}
                          />
                          {selectedToken.address === token.address && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
                            >
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 relative">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-base sm:text-lg truncate group-hover:text-purple-100 transition-colors">
                              {token.symbol}
                            </span>
                            {selectedToken.address === token.address && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg"
                              >
                                <span className="text-xs text-purple-300 font-medium">Selected</span>
                              </motion.div>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                            {token.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            {token.address.slice(0, 6)}...{token.address.slice(-4)}
                          </div>
                        </div>

                        {/* Balance placeholder */}
                        <div className="text-right relative">
                          <div className="text-xs sm:text-sm font-semibold text-white">0.0000</div>
                          <div className="text-xs text-gray-400">$0.00</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 sm:p-12 text-center"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <div className="text-gray-400 text-sm sm:text-base font-medium mb-2">
                      No tokens found
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm">
                      Try searching with a different term
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-gradient-to-r from-gray-900/95 to-gray-800/95">
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Can't find your token? 
                    <button className="text-purple-400 hover:text-purple-300 ml-1 font-medium transition-colors">
                      Import custom token
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TokenSelector;
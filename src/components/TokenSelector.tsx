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

      {/* ULTRA HIGH Z-INDEX MODAL PORTAL - GUARANTEED FIRST PLANE */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Create a portal-like container with MAXIMUM z-index */}
            <div 
              className="token-selector-modal-container"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999999, // ULTRA HIGH Z-INDEX
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
            >
              {/* ULTRA HIGH Z-INDEX BACKDROP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999999998,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
                onClick={handleCloseModal}
              />
              
              {/* ULTRA HIGH Z-INDEX MODAL CONTAINER */}
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
                style={{ 
                  position: 'relative',
                  zIndex: 999999999, // ULTRA HIGH Z-INDEX
                  width: '100%',
                  maxWidth: '32rem', // sm:max-w-lg
                  maxHeight: '85vh',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.99) 0%, rgba(31, 41, 55, 0.99) 100%)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Decorative top border */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.8) 50%, transparent 100%)'
                  }}
                />
                
                {/* Header */}
                <div 
                  style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{
                          padding: '8px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                          border: '1px solid rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        <Star style={{ width: '20px', height: '20px', color: 'rgb(196, 181, 253)' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                          Select Token
                        </h3>
                        <p style={{ fontSize: '14px', color: 'rgb(156, 163, 175)', margin: 0 }}>
                          Choose from available tokens
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseModal}
                      style={{
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'rgb(156, 163, 175)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <X style={{ width: '20px', height: '20px' }} />
                    </motion.button>
                  </div>
                  
                  {/* Enhanced Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search 
                      style={{ 
                        position: 'absolute', 
                        left: '16px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '20px', 
                        height: '20px', 
                        color: 'rgb(156, 163, 175)' 
                      }} 
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by name or symbol..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        color: 'white',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.7)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          padding: '4px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <X style={{ width: '16px', height: '16px', color: 'rgb(156, 163, 175)' }} />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Token List */}
                <div 
                  style={{
                    maxHeight: '384px',
                    overflowY: 'auto',
                    background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)'
                  }}
                >
                  {filteredTokens.length > 0 ? (
                    <div style={{ padding: '8px' }}>
                      {filteredTokens.map((token, index) => (
                        <motion.button
                          key={token.address}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ 
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.15)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectToken(token)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            textAlign: 'left',
                            borderRadius: '16px',
                            background: 'transparent',
                            border: '1px solid transparent',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                        >
                          {/* Background gradient on hover */}
                          <div 
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              pointerEvents: 'none'
                            }}
                          />
                          
                          <div style={{ position: 'relative' }}>
                            <img 
                              src={token.logoURI} 
                              alt={token.symbol}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                border: '2px solid rgba(255, 255, 255, 0.2)'
                              }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/48x48/6C5CE7/FFFFFF?text=' + token.symbol[0];
                              }}
                            />
                            {selectedToken.address === token.address && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  width: '16px',
                                  height: '16px',
                                  background: 'rgb(139, 92, 246)',
                                  borderRadius: '50%',
                                  border: '2px solid rgb(17, 24, 39)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <div 
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    background: 'white',
                                    borderRadius: '50%'
                                  }}
                                />
                              </motion.div>
                            )}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span 
                                style={{
                                  fontWeight: 'bold',
                                  color: 'white',
                                  fontSize: '18px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {token.symbol}
                              </span>
                              {selectedToken.address === token.address && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  style={{
                                    padding: '4px 8px',
                                    background: 'rgba(139, 92, 246, 0.3)',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <span style={{ fontSize: '12px', color: 'rgb(196, 181, 253)', fontWeight: 'medium' }}>
                                    Selected
                                  </span>
                                </motion.div>
                              )}
                            </div>
                            <div 
                              style={{
                                fontSize: '14px',
                                color: 'rgb(156, 163, 175)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {token.name}
                            </div>
                            <div 
                              style={{
                                fontSize: '12px',
                                color: 'rgb(107, 114, 128)',
                                marginTop: '4px',
                                fontFamily: 'monospace'
                              }}
                            >
                              {token.address.slice(0, 6)}...{token.address.slice(-4)}
                            </div>
                          </div>

                          {/* Balance placeholder */}
                          <div style={{ textAlign: 'right', position: 'relative' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                              0.0000
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgb(156, 163, 175)' }}>
                              $0.00
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ padding: '48px', textAlign: 'center' }}
                    >
                      <div 
                        style={{
                          width: '64px',
                          height: '64px',
                          margin: '0 auto 16px',
                          borderRadius: '50%',
                          background: 'rgba(107, 114, 128, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Search style={{ width: '32px', height: '32px', color: 'rgb(156, 163, 175)' }} />
                      </div>
                      <div style={{ color: 'rgb(156, 163, 175)', fontSize: '16px', fontWeight: 'medium', marginBottom: '8px' }}>
                        No tokens found
                      </div>
                      <div style={{ color: 'rgb(107, 114, 128)', fontSize: '14px' }}>
                        Try searching with a different term
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div 
                  style={{
                    padding: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'rgb(156, 163, 175)', margin: 0 }}>
                      Can't find your token? 
                      <button 
                        style={{ 
                          color: 'rgb(196, 181, 253)', 
                          marginLeft: '4px', 
                          fontWeight: 'medium', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(221, 214, 254)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(196, 181, 253)'}
                      >
                        Import custom token
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TokenSelector;
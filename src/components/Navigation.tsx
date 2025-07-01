import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: 'swap' | 'liquidity' | 'cross-swap' | 'bridge';
  onTabChange: (tab: 'swap' | 'liquidity' | 'cross-swap' | 'bridge') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'swap', label: 'Swap' },
    { id: 'liquidity', label: 'Liquidity' },
    { id: 'cross-swap', label: 'Cross Swap', shortLabel: 'Cross' },
    { id: 'bridge', label: 'Bridge' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        flex p-1 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10
        mb-4 sm:mb-6 w-full max-w-sm sm:max-w-md mx-auto overflow-hidden
      "
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative flex-1 py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium
            transition-all duration-200 min-w-0
            ${activeTab === tab.id
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="
                absolute inset-0 rounded-xl
                bg-gradient-to-r from-purple-600 to-blue-600
              "
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 truncate">
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Navigation;
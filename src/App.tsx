import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import HomePage from './components/HomePage';
import SwapPage from './components/SwapPage';
import SpaceBackground from './components/SpaceBackground';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'swap'>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'swap':
        return <SwapPage onNavigateHome={() => setCurrentPage('home')} />;
      case 'home':
      default:
        return <HomePage onNavigateToSwap={() => setCurrentPage('swap')} />;
    }
  };

  return (
    <Web3Provider>
      <div className="min-h-screen relative flex flex-col overflow-x-hidden">
        {/* Space Background */}
        <SpaceBackground />

        {/* Main Content */}
        <main className="relative z-10 flex-1">
          {renderPage()}
        </main>

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
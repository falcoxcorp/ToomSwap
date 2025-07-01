import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Rocket,
  Star,
  Globe,
  BarChart3,
  Lock,
  Coins,
  Droplets,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  Play
} from 'lucide-react';
import ConnectWalletButton from './ConnectWalletButton';
import Footer from './Footer';

interface HomePageProps {
  onNavigateToSwap: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToSwap }) => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Swaps",
      description: "Execute trades in milliseconds with our optimized smart contracts on Supra EVM",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Maximum Security",
      description: "Audited smart contracts and non-custodial trading ensure your funds stay safe",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description: "Advanced routing algorithms find the optimal path for your trades",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Droplets,
      title: "Deep Liquidity",
      description: "Earn fees by providing liquidity to our high-volume trading pairs",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const stats = [
    { label: "Total Volume", value: "$2.5B+", icon: BarChart3 },
    { label: "Active Users", value: "150K+", icon: Users },
    { label: "Trading Pairs", value: "500+", icon: Coins },
    { label: "Liquidity Pools", value: "1,200+", icon: Droplets }
  ];

  const roadmapItems = [
    {
      quarter: "Q1 2025",
      title: "Cross-Chain Bridge",
      description: "Connect multiple blockchains for seamless asset transfers",
      status: "upcoming"
    },
    {
      quarter: "Q2 2025",
      title: "Advanced Analytics",
      description: "Professional trading tools and portfolio management",
      status: "upcoming"
    },
    {
      quarter: "Q3 2025",
      title: "Mobile App",
      description: "Native iOS and Android applications",
      status: "upcoming"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
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
              const fallback = document.createElement('div');
              fallback.className = 'h-8 sm:h-10 md:h-12 w-24 sm:w-28 md:w-32 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center';
              fallback.innerHTML = '<span class="text-white font-bold text-sm sm:text-base md:text-lg">ToonSwap</span>';
              e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
            }}
          />
        </motion.div>
        
        <nav className="hidden md:flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToSwap}
            className="text-white hover:text-purple-300 transition-colors font-medium"
          >
            Swap
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-white hover:text-purple-300 transition-colors font-medium"
          >
            Pools
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-white hover:text-purple-300 transition-colors font-medium"
          >
            Analytics
          </motion.button>
        </nav>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToSwap}
            className="
              hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
              bg-white/10 hover:bg-white/20 border border-white/20 text-white
              transition-all duration-200
            "
          >
            <ArrowUpDown className="w-4 h-4" />
            Launch App
          </motion.button>
          <ConnectWalletButton />
        </div>
      </motion.header>

      {/* Hero Section with Split Layout */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          
          {/* Left Content */}
          <div className="text-left max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                border border-purple-500/30 text-purple-300
              ">
                <Rocket className="w-4 h-4" />
                Now Live on Supra EVM
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="
                text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6
                bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent
                leading-tight
              "
            >
              Where Your Crypto
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Journey Takes Flight
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="
                text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12
                leading-relaxed
              "
            >
              Experience the future of DeFi trading on Supra EVM. Lightning-fast swaps, 
              deep liquidity, and professional-grade features that put you in control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToSwap}
                className="
                  group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
                  bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                  text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300
                  min-w-[200px] justify-center
                "
              >
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Trading
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                  group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
                  bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30
                  text-white backdrop-blur-sm transition-all duration-300
                  min-w-[200px] justify-center
                "
              >
                <Play className="w-5 h-5" />
                Watch Demo
                <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </motion.div>
          </div>

          {/* Right Floating Image */}
          <div className="flex justify-center lg:justify-end items-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              {/* Floating Animation Container */}
              <motion.div
                animate={{ 
                  y: [-20, 20, -20],
                  rotate: [-2, 2, -2]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative"
              >
                {/* Glow Effects */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="
                    absolute inset-0 rounded-full 
                    bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-pink-500/30 
                    blur-3xl scale-150
                  "
                />

                {/* Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="
                    absolute inset-0 rounded-full border-2 border-purple-500/20
                    scale-125
                  "
                />

                {/* Inner Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="
                    absolute inset-0 rounded-full border border-blue-500/30
                    scale-110
                  "
                />

                {/* Main Image with Hover Effects */}
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                  className="relative z-10 cursor-pointer group"
                >
                  {/* Hover Glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1.3,
                      transition: { duration: 0.3 }
                    }}
                    className="
                      absolute inset-0 rounded-full 
                      bg-gradient-to-r from-purple-400/40 via-blue-400/40 to-pink-400/40 
                      blur-2xl
                    "
                  />

                  {/* Sparkle Effects on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: 0 }}
                        whileHover={{ 
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360],
                          transition: { 
                            duration: 1.5, 
                            delay: i * 0.1,
                            repeat: Infinity
                          }
                        }}
                        className={`
                          absolute w-2 h-2 bg-white rounded-full
                          ${i === 0 ? 'top-0 left-1/2' : ''}
                          ${i === 1 ? 'top-1/4 right-0' : ''}
                          ${i === 2 ? 'top-1/2 right-1/4' : ''}
                          ${i === 3 ? 'bottom-1/4 right-0' : ''}
                          ${i === 4 ? 'bottom-0 left-1/2' : ''}
                          ${i === 5 ? 'bottom-1/4 left-0' : ''}
                          ${i === 6 ? 'top-1/2 left-1/4' : ''}
                          ${i === 7 ? 'top-1/4 left-0' : ''}
                        `}
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))'
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Main Image */}
                  <img 
                    src="https://photos.pinksale.finance/file/pinksale-logo-upload/1751340117625-d2371bebc3fdcb22c0a5fd894afa1aea.png"
                    alt="ToonSwap Character"
                    className="
                      w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 
                      object-contain relative z-10
                      filter drop-shadow-2xl
                      group-hover:drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]
                      transition-all duration-300
                    "
                    onError={(e) => {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center relative z-10';
                      fallback.innerHTML = '<span class="text-white font-bold text-4xl">🚀</span>';
                      e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
                    }}
                  />

                  {/* Floating Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: [-10, -30, -10],
                          x: [0, Math.sin(i) * 20, 0],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{ 
                          duration: 3 + i * 0.5, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: i * 0.5
                        }}
                        className={`
                          absolute w-1 h-1 bg-purple-400 rounded-full
                          ${i % 2 === 0 ? 'bg-purple-400' : 'bg-blue-400'}
                        `}
                        style={{
                          left: `${20 + (i * 15)}%`,
                          top: `${30 + (i * 10)}%`,
                          filter: 'blur(0.5px)'
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="
                p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10
                hover:border-white/20 transition-all duration-300 group text-center
              "
            >
              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="
            text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4
            bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent
          ">
            Why Choose ToonSwap?
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Built for traders who demand the best. Experience DeFi like never before.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="
                p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10
                backdrop-blur-xl border border-white/10 hover:border-white/20
                transition-all duration-300 group
              "
            >
              <div className={`
                w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${feature.color}
                flex items-center justify-center mb-4 sm:mb-6
                group-hover:scale-110 transition-transform duration-300
              `}>
                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="
            text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4
            bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent
          ">
            Start Trading in 3 Steps
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Get started with ToonSwap in minutes. No complex setup required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              step: "01",
              title: "Connect Wallet",
              description: "Install StarKey wallet and connect to Supra EVM network",
              icon: Lock
            },
            {
              step: "02",
              title: "Select Tokens",
              description: "Choose the tokens you want to swap from our extensive list",
              icon: Coins
            },
            {
              step: "03",
              title: "Execute Trade",
              description: "Confirm your transaction and enjoy lightning-fast execution",
              icon: Zap
            }
          ].map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center group"
            >
              <div className="
                relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full
                bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center
                group-hover:scale-110 transition-transform duration-300
              ">
                <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                <div className="
                  absolute -top-2 -right-2 w-8 h-8 rounded-full
                  bg-gradient-to-r from-pink-500 to-purple-500
                  flex items-center justify-center text-white font-bold text-sm
                ">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="
            text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4
            bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent
          ">
            What's Coming Next
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            We're constantly innovating to bring you the best DeFi experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.quarter}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="
                p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10
                backdrop-blur-xl border border-white/10 hover:border-purple-500/30
                transition-all duration-300 group relative overflow-hidden
              "
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-bl-3xl" />
              <div className="relative">
                <div className="text-purple-400 font-bold text-sm mb-2">
                  {item.quarter}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4">
                  {item.description}
                </p>
                <div className="
                  inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                  bg-orange-500/20 text-orange-300 border border-orange-500/30
                ">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  Coming Soon
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            text-center p-8 sm:p-12 rounded-3xl
            bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20
            border border-purple-500/30 backdrop-blur-xl
          "
        >
          <h2 className="
            text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6
            bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent
          ">
            Ready to Take Flight?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of traders who have already discovered the future of DeFi trading.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateToSwap}
              className="
                group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
                bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300
                min-w-[200px] justify-center
              "
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Launch ToonSwap
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
                bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30
                text-white backdrop-blur-sm transition-all duration-300
                min-w-[200px] justify-center
              "
            >
              <Globe className="w-5 h-5" />
              Join Community
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
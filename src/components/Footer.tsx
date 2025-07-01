import React from 'react';
import { motion } from 'framer-motion';
import { 
  Twitter, 
  Github, 
  MessageCircle, 
  Globe, 
  Shield, 
  FileText, 
  Users, 
  TrendingUp,
  ExternalLink,
  Mail
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-gray-300' },
    { icon: MessageCircle, href: '#', label: 'Discord', color: 'hover:text-indigo-400' },
    { icon: Globe, href: '#', label: 'Website', color: 'hover:text-green-400' },
  ];

  const quickLinks = [
    { icon: TrendingUp, label: 'Analytics', href: '#' },
    { icon: FileText, label: 'Documentation', href: '#' },
    { icon: Users, label: 'Community', href: '#' },
    { icon: Shield, label: 'Security', href: '#' },
  ];

  const legalLinks = [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Risk Disclaimer', href: '#' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="
        relative mt-12 sm:mt-20 bg-gradient-to-br from-gray-900/95 to-gray-800/95
        backdrop-blur-xl border-t border-white/10
      "
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center mb-4">
              <img 
                src="https://photos.pinksale.finance/file/pinksale-logo-upload/1751325718950-5662c9ae5d79628fc42380b8cf1b27f4.png"
                alt="ToonSwap Logo"
                className="h-8 sm:h-10 w-auto object-contain mr-3"
                onError={(e) => {
                  const fallback = document.createElement('div');
                  fallback.className = 'h-8 sm:h-10 w-20 sm:w-24 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mr-3';
                  fallback.innerHTML = '<span class="text-white font-bold text-xs sm:text-sm">ToonSwap</span>';
                  e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
                }}
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">ToonSwap</h3>
                <p className="text-xs sm:text-sm text-gray-400">Decentralized Exchange</p>
              </div>
            </div>
            
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-md">
              The most advanced decentralized exchange on Supra EVM. Trade tokens instantly 
              with the lowest fees and highest security standards in DeFi.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`
                    p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
                    text-gray-400 ${social.color} transition-all duration-200
                    group
                  `}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className="
                      flex items-center gap-2 text-gray-400 hover:text-white
                      transition-colors duration-200 group text-xs sm:text-sm
                    "
                  >
                    <link.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-purple-400 transition-colors" />
                    {link.label}
                    <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              Legal & Support
            </h4>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {legalLinks.map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className="
                      text-gray-400 hover:text-white transition-colors duration-200
                      text-xs sm:text-sm hover:underline
                    "
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="
                p-3 rounded-xl bg-gradient-to-r from-purple-600/10 to-blue-600/10
                border border-purple-500/20
              "
            >
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                <span className="text-xs sm:text-sm font-medium text-white">Support</span>
              </div>
              <a
                href="mailto:support@toonswap.com"
                className="text-xs text-gray-400 hover:text-purple-300 transition-colors break-all"
              >
                support@toonswap.com
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="
            mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10
            flex flex-col md:flex-row items-center justify-between gap-4
          "
        >
          <div className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
            <p>© {currentYear} ToonSwap. All rights reserved.</p>
            <p className="text-xs mt-1 text-gray-500">
              Built on Supra EVM • Powered by innovation
            </p>
          </div>

          {/* Network Status */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl
              bg-green-500/10 border border-green-500/20
            "
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm text-green-400 font-medium">
              Supra Network Active
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </motion.footer>
  );
};

export default Footer;
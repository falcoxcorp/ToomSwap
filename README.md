# ToonSwap - Decentralized Exchange on Supra EVM

🚀 **Where Your Crypto Journey Takes Flight!**

ToonSwap is a professional decentralized exchange built on Supra EVM, offering lightning-fast swaps, deep liquidity, and an immersive space-themed trading experience.

## 🌟 Features

### ✅ **FULLY FUNCTIONAL ON SUPRA TESTNET**
- **Real Trading**: Execute actual swaps using Supra testnet contracts
- **Real Liquidity Pools**: Add and remove liquidity from real pools
- **Real Balances**: Live balance detection and updates
- **Real Prices**: Integration with DexScreener API for accurate pricing

### 🔧 **Core Functionality**
- **Token Swaps**: Native SUPRA ↔ Tokens, Token ↔ Token
- **Liquidity Provision**: Add/Remove liquidity with real LP tokens
- **Price Discovery**: Real-time pricing from DexScreener API
- **Slippage Protection**: Configurable slippage tolerance
- **Balance Management**: Real-time balance tracking

### 🛡️ **Security & Reliability**
- **Smart Contract Integration**: Real Supra DEX contracts
- **Wallet Integration**: StarKey wallet support
- **Error Handling**: Comprehensive error management
- **Transaction Safety**: Pre-transaction validations

## 🌐 Network Support

### **Supra Testnet (Chain ID: 8) - ✅ FULLY OPERATIONAL**
- **Router**: `0x99b5a05bCceC10f52d1fF139b5AAF852ec748Fae`
- **Factory**: `0x30F2d7b7413c9A774FB92Ff2c952C9501363dd22`
- **WSUPRA**: `0xb4b7b25d5b05eee26ca81a616dfc68e069622129`
- **Status**: All features available for testing

### **Supra Mainnet (Chain ID: 7) - 🚧 PENDING DEPLOYMENT**
- **Status**: Contracts not yet deployed
- **Note**: Will be updated when mainnet contracts are available

## 🚀 Getting Started

### Prerequisites
1. **StarKey Wallet**: Install from Chrome Web Store
2. **Supra Testnet**: Switch to Supra Testnet for full functionality
3. **Test Tokens**: Get test SUPRA from faucet

### Installation
```bash
npm install
npm run dev
```

### Usage
1. **Connect Wallet**: Click "Connect StarKey" and approve connection
2. **Switch Network**: Ensure you're on Supra Testnet (Chain ID: 8)
3. **Start Trading**: Use the swap interface for token exchanges
4. **Add Liquidity**: Provide liquidity to earn fees
5. **Monitor Portfolio**: Track your positions and earnings

## 🔧 Technical Architecture

### **Smart Contract Integration**
- **DexService**: Handles all blockchain interactions
- **Real ABIs**: Complete contract interfaces for Router, Factory, Pairs
- **Token Management**: ERC20 token handling with approvals
- **Transaction Management**: Proper gas estimation and error handling

### **Price Integration**
- **DexScreener API**: Real-time price feeds
- **Fallback System**: Hardcoded prices when API unavailable
- **Cache System**: 30-second cache for optimal performance
- **Multi-token Support**: Batch price requests

### **User Experience**
- **Real-time Updates**: Live balance and price updates
- **Loading States**: Clear feedback during transactions
- **Error Messages**: Descriptive error handling
- **Responsive Design**: Mobile-friendly interface

## 📊 Supported Operations

### **Trading**
- ✅ SUPRA → Token swaps
- ✅ Token → SUPRA swaps  
- ✅ Token → Token swaps
- ✅ Real price impact calculation
- ✅ Slippage protection

### **Liquidity Provision**
- ✅ Add liquidity (SUPRA + Token)
- ✅ Add liquidity (Token + Token)
- ✅ Remove liquidity with LP tokens
- ✅ Real pool ratio calculations
- ✅ LP token management

### **Portfolio Management**
- ✅ Real-time balance tracking
- ✅ USD value calculations
- ✅ Transaction history
- ✅ Position monitoring

## 🛡️ Safety Features

### **Pre-transaction Validations**
- Balance verification before swaps
- Contract existence checks
- Network compatibility validation
- Slippage and price impact warnings

### **Error Handling**
- User-friendly error messages
- Transaction failure recovery
- Network error handling
- Fallback mechanisms

### **Security Measures**
- Non-custodial design
- Smart contract audited interfaces
- Secure wallet integration
- Transaction confirmation requirements

## 🌟 Production Readiness

### **Testnet Status: ✅ READY**
- All features fully functional
- Real contract integration
- Comprehensive testing completed
- Production-grade error handling

### **Mainnet Status: 🚧 PENDING**
- Contracts awaiting deployment
- Will be updated when available
- Fallback notifications implemented

## 🔗 Links

- **Live Demo**: [ToonSwap on Netlify](https://ephemeral-pie-39a3c0.netlify.app/)
- **Supra Network**: [Official Website](https://supra.com/)
- **StarKey Wallet**: [Chrome Extension](https://chromewebstore.google.com/detail/starkey-wallet-the-offici/hcjhpkgbmechpabifbggldplacolbkoh)

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Supra ecosystem**

*Ready for production deployment on Supra Testnet with full DEX functionality!*
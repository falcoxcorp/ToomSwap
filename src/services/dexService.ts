import { ethers } from 'ethers';
import { getContractAddresses } from '../constants/addresses';
import { Token, isNativeToken } from '../constants/tokens';
import { ROUTER_ABI, FACTORY_ABI, PAIR_ABI, ERC20_ABI, WSUPRA_ABI } from '../contracts/abis';

export class DexService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private chainId: number;
  private contracts: ReturnType<typeof getContractAddresses>;

  constructor(provider: ethers.providers.Web3Provider, signer: ethers.Signer, chainId: number) {
    this.provider = provider;
    this.signer = signer;
    this.chainId = chainId;
    this.contracts = getContractAddresses(chainId);
  }

  // Get router contract instance
  private getRouterContract() {
    return new ethers.Contract(this.contracts.ROUTER, ROUTER_ABI, this.signer);
  }

  // Get factory contract instance
  private getFactoryContract() {
    return new ethers.Contract(this.contracts.FACTORY, FACTORY_ABI, this.provider);
  }

  // Get ERC20 token contract instance
  private getTokenContract(tokenAddress: string) {
    return new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
  }

  // Get pair contract instance
  private getPairContract(pairAddress: string) {
    return new ethers.Contract(pairAddress, PAIR_ABI, this.provider);
  }

  // Check if pair exists
  async pairExists(tokenA: Token, tokenB: Token): Promise<boolean> {
    try {
      const factory = this.getFactoryContract();
      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      return pairAddress !== ethers.constants.AddressZero;
    } catch (error) {
      console.error('Error checking pair existence:', error);
      return false;
    }
  }

  // Get pair address
  async getPairAddress(tokenA: Token, tokenB: Token): Promise<string | null> {
    try {
      const factory = this.getFactoryContract();
      const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
      return pairAddress !== ethers.constants.AddressZero ? pairAddress : null;
    } catch (error) {
      console.error('Error getting pair address:', error);
      return null;
    }
  }

  // Get pair reserves
  async getPairReserves(tokenA: Token, tokenB: Token): Promise<{ reserveA: string; reserveB: string } | null> {
    try {
      const pairAddress = await this.getPairAddress(tokenA, tokenB);
      if (!pairAddress) return null;

      const pair = this.getPairContract(pairAddress);
      const [reserve0, reserve1] = await pair.getReserves();
      
      const token0 = await pair.token0();
      const isToken0A = token0.toLowerCase() === tokenA.address.toLowerCase();
      
      return {
        reserveA: isToken0A ? reserve0.toString() : reserve1.toString(),
        reserveB: isToken0A ? reserve1.toString() : reserve0.toString()
      };
    } catch (error) {
      console.error('Error getting pair reserves:', error);
      return null;
    }
  }

  // Get amounts out for swap
  async getAmountsOut(amountIn: string, path: string[]): Promise<string[]> {
    try {
      const router = this.getRouterContract();
      const amounts = await router.getAmountsOut(
        ethers.utils.parseUnits(amountIn, 18),
        path
      );
      return amounts.map((amount: ethers.BigNumber) => ethers.utils.formatUnits(amount, 18));
    } catch (error) {
      console.error('Error getting amounts out:', error);
      throw error;
    }
  }

  // Check and approve token allowance
  async checkAndApproveToken(token: Token, amount: string): Promise<boolean> {
    try {
      if (isNativeToken(token)) return true; // Native tokens don't need approval

      const tokenContract = this.getTokenContract(token.address);
      const account = await this.signer.getAddress();
      
      const allowance = await tokenContract.allowance(account, this.contracts.ROUTER);
      const requiredAmount = ethers.utils.parseUnits(amount, token.decimals);
      
      if (allowance.lt(requiredAmount)) {
        console.log(`Approving ${token.symbol}...`);
        const approveTx = await tokenContract.approve(
          this.contracts.ROUTER,
          ethers.constants.MaxUint256
        );
        await approveTx.wait();
        console.log(`${token.symbol} approved successfully`);
      }
      
      return true;
    } catch (error) {
      console.error('Error approving token:', error);
      throw error;
    }
  }

  // Execute token swap
  async executeSwap(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    amountOutMin: string,
    slippageTolerance: number = 0.5
  ): Promise<ethers.ContractTransaction> {
    try {
      const router = this.getRouterContract();
      const account = await this.signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      const amountInWei = ethers.utils.parseUnits(amountIn, tokenIn.decimals);
      const amountOutMinWei = ethers.utils.parseUnits(amountOutMin, tokenOut.decimals);

      // Apply slippage tolerance
      const slippageMultiplier = (100 - slippageTolerance) / 100;
      const finalAmountOutMin = amountOutMinWei.mul(Math.floor(slippageMultiplier * 100)).div(100);

      let tx: ethers.ContractTransaction;

      if (isNativeToken(tokenIn)) {
        // Swapping native SUPRA for tokens
        await this.checkAndApproveToken(tokenOut, '0'); // Just to validate
        tx = await router.swapExactETHForTokens(
          finalAmountOutMin,
          [this.contracts.WSUPRA, tokenOut.address],
          account,
          deadline,
          { value: amountInWei }
        );
      } else if (isNativeToken(tokenOut)) {
        // Swapping tokens for native SUPRA
        await this.checkAndApproveToken(tokenIn, amountIn);
        tx = await router.swapExactTokensForETH(
          amountInWei,
          finalAmountOutMin,
          [tokenIn.address, this.contracts.WSUPRA],
          account,
          deadline
        );
      } else {
        // Swapping tokens for tokens
        await this.checkAndApproveToken(tokenIn, amountIn);
        tx = await router.swapExactTokensForTokens(
          amountInWei,
          finalAmountOutMin,
          [tokenIn.address, tokenOut.address],
          account,
          deadline
        );
      }

      return tx;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  // Add liquidity
  async addLiquidity(
    tokenA: Token,
    tokenB: Token,
    amountA: string,
    amountB: string,
    slippageTolerance: number = 0.5
  ): Promise<ethers.ContractTransaction> {
    try {
      const router = this.getRouterContract();
      const account = await this.signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      const amountAWei = ethers.utils.parseUnits(amountA, tokenA.decimals);
      const amountBWei = ethers.utils.parseUnits(amountB, tokenB.decimals);

      // Apply slippage tolerance
      const slippageMultiplier = (100 - slippageTolerance) / 100;
      const amountAMin = amountAWei.mul(Math.floor(slippageMultiplier * 100)).div(100);
      const amountBMin = amountBWei.mul(Math.floor(slippageMultiplier * 100)).div(100);

      let tx: ethers.ContractTransaction;

      if (isNativeToken(tokenA)) {
        // Adding native SUPRA + token liquidity
        await this.checkAndApproveToken(tokenB, amountB);
        tx = await router.addLiquidityETH(
          tokenB.address,
          amountBWei,
          amountBMin,
          amountAMin,
          account,
          deadline,
          { value: amountAWei }
        );
      } else if (isNativeToken(tokenB)) {
        // Adding token + native SUPRA liquidity
        await this.checkAndApproveToken(tokenA, amountA);
        tx = await router.addLiquidityETH(
          tokenA.address,
          amountAWei,
          amountAMin,
          amountBMin,
          account,
          deadline,
          { value: amountBWei }
        );
      } else {
        // Adding token + token liquidity
        await this.checkAndApproveToken(tokenA, amountA);
        await this.checkAndApproveToken(tokenB, amountB);
        tx = await router.addLiquidity(
          tokenA.address,
          tokenB.address,
          amountAWei,
          amountBWei,
          amountAMin,
          amountBMin,
          account,
          deadline
        );
      }

      return tx;
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  // Remove liquidity
  async removeLiquidity(
    tokenA: Token,
    tokenB: Token,
    liquidity: string,
    amountAMin: string,
    amountBMin: string
  ): Promise<ethers.ContractTransaction> {
    try {
      const router = this.getRouterContract();
      const account = await this.signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      const liquidityWei = ethers.utils.parseUnits(liquidity, 18);
      const amountAMinWei = ethers.utils.parseUnits(amountAMin, tokenA.decimals);
      const amountBMinWei = ethers.utils.parseUnits(amountBMin, tokenB.decimals);

      // First approve the LP token
      const pairAddress = await this.getPairAddress(tokenA, tokenB);
      if (!pairAddress) throw new Error('Pair does not exist');

      const pairContract = this.getPairContract(pairAddress);
      const allowance = await pairContract.allowance(account, this.contracts.ROUTER);
      
      if (allowance.lt(liquidityWei)) {
        const approveTx = await pairContract.approve(this.contracts.ROUTER, liquidityWei);
        await approveTx.wait();
      }

      let tx: ethers.ContractTransaction;

      if (isNativeToken(tokenA) || isNativeToken(tokenB)) {
        // Removing liquidity with native SUPRA
        const token = isNativeToken(tokenA) ? tokenB : tokenA;
        const tokenMin = isNativeToken(tokenA) ? amountBMinWei : amountAMinWei;
        const ethMin = isNativeToken(tokenA) ? amountAMinWei : amountBMinWei;

        tx = await router.removeLiquidityETH(
          token.address,
          liquidityWei,
          tokenMin,
          ethMin,
          account,
          deadline
        );
      } else {
        // Removing token + token liquidity
        tx = await router.removeLiquidity(
          tokenA.address,
          tokenB.address,
          liquidityWei,
          amountAMinWei,
          amountBMinWei,
          account,
          deadline
        );
      }

      return tx;
    } catch (error) {
      console.error('Error removing liquidity:', error);
      throw error;
    }
  }

  // Get token balance
  async getTokenBalance(token: Token, account: string): Promise<string> {
    try {
      if (isNativeToken(token)) {
        const balance = await this.provider.getBalance(account);
        return ethers.utils.formatEther(balance);
      } else {
        const tokenContract = this.getTokenContract(token.address);
        const balance = await tokenContract.balanceOf(account);
        return ethers.utils.formatUnits(balance, token.decimals);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }
}
// SPDX-License-Identifier: MIT
pragma solidity 0.8.*;

import './IErc20Swapper.sol';
import './IErc20.sol';
import './ISwapRouter.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@uniswap/v3-core/contracts/libraries/FullMath.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';


contract Swapper is ERC20Swapper {
    ISwapRouter swapRouter;
    IUniswapV3Factory v3Factory;
    address public weth;
    uint24 poolFee;
    uint24 public slippage;

    event ReceivedFromSwap(address token, uint256 amount);

    constructor(address swapRouterAddress, address v3FactoryAddress, address _weth, uint24 _poolFee, uint24 _slippage) {
        swapRouter = ISwapRouter(swapRouterAddress);
        v3Factory = IUniswapV3Factory(v3FactoryAddress);
        weth = _weth;
        poolFee = _poolFee;
        slippage = _slippage;
    }

    function getCurrentSqrtRatioX96(address token) public view returns (uint160) {
        IUniswapV3Pool pool = IUniswapV3Pool(v3Factory.getPool(weth, token, poolFee));
        (uint160 sqrtPriceX96,,,,,,) = pool.slot0();
        return sqrtPriceX96;
    }

    // modification of the function `getQuoteAtTick` from https://github.com/Uniswap/v3-periphery
    function getQuoteAtSqrtRatioX96(
        uint160 sqrtRatioX96,
        uint128 baseAmount,
        address baseToken,
        address quoteToken
    ) internal pure returns (uint256 quoteAmount) {

        // Calculate quoteAmount with better precision if it doesn't overflow when multiplied by itself
        if (sqrtRatioX96 <= type(uint128).max) {
            uint256 ratioX192 = uint256(sqrtRatioX96) * sqrtRatioX96;
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX192, baseAmount, 1 << 192)
                : FullMath.mulDiv(1 << 192, baseAmount, ratioX192);
        } else {
            uint256 ratioX128 = FullMath.mulDiv(sqrtRatioX96, sqrtRatioX96, 1 << 64);
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX128, baseAmount, 1 << 128)
                : FullMath.mulDiv(1 << 128, baseAmount, ratioX128);
        }
    }

    function swapEtherToToken(address token, uint minAmount) public payable returns (uint) {
        uint160 currentSqrtPriceX96 = getCurrentSqrtRatioX96(token);

        uint256 minAmountIn = getQuoteAtSqrtRatioX96({
            sqrtRatioX96: currentSqrtPriceX96,
            baseAmount: uint128(minAmount),
            baseToken: token,
            quoteToken: weth
        }) * (1000 + uint256(slippage)) / 1000;

        uint256 amountIn = msg.value;
        require(amountIn >= minAmountIn, 'Swapper::swapEtherToToken: Not enough founds');

        // compute priceLmit based on current price and slippage
        int24 currentTick = TickMath.getTickAtSqrtRatio(currentSqrtPriceX96);
        uint160 priceLimit = TickMath.getSqrtRatioAtTick(currentTick + int24(slippage));

        // deposit ETH to get WETH
        IWeth(weth).deposit{value: amountIn}();

        // Approve the router to spend WETH.
        IWeth(weth).approve(address(swapRouter), amountIn);

        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: weth,
                tokenOut: token,
                fee: poolFee,
                recipient: msg.sender,
                // deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minAmount,
                sqrtPriceLimitX96: priceLimit
            });

        // The call to `exactInputSingle` executes the swap.
        uint amountOut = swapRouter.exactInputSingle(params);
        emit ReceivedFromSwap(token, amountOut);
        return amountOut;
    }
}

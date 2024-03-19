// SPDX-License-Identifier: MIT
pragma solidity 0.8.*;


// Copied from Uniswap V3 Periphery and modified
// to work with deployed contracts on Sepolia
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        /* Removed deadline field */
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

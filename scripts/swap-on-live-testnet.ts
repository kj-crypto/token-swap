import { ethers, network } from "hardhat";
import { usdcAddress } from "./consts";

const swapperAddress = "0x92A2B74102d669A49b98B0eD2E371548468b79d0";

async function swap() {
    if(network.name !== 'sepolia') {
        throw new Error('Only for sepolia network')
    }

    const swapper = await ethers.getContractAt("Swapper", swapperAddress);
    const usdc = await ethers.getContractAt("IERC20", usdcAddress);
    const user = (await ethers.getSigners())[0];
    const eth = BigInt(8e15); // 0.008 eth

    console.log("Initial USDC balance ", await usdc.balanceOf(user.address));
    const tx = await swapper.swapEtherToToken(usdcAddress, 5e4, {value: eth});
    await tx.wait(2);
    console.log("USDC balance after swap", await usdc.balanceOf(user.address));
}

swap().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
